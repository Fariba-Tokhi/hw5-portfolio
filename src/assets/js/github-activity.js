class GitHubActivity extends HTMLElement {
  static get observedAttributes() {
    return ['username', 'limit'];
  }
  
  constructor() {
    super();
    this.username = this.getAttribute('username') || 'Fariba-Tokhi';
    this.limit = parseInt(this.getAttribute('limit')) || 5;
    this.abortController = null;
    this.timeoutId = null;
    this.retryCount = 0;
    this.maxRetries = 2;
    
    this.attachShadow({ mode: 'open' });
    
    // Create template - this is the ONLY place innerHTML is used (template definition)
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        :host {
          display: block;
          border: 1px solid var(--color-border, #666);
          padding: 15px;
          margin: 10px 0;
          background: var(--color-card-bg, #f5f5f5);
        }
        :host([state="loading"]) .content { opacity: 0.6; }
        :host([state="error"]) .error { display: block; }
        :host([state="success"]) .error { display: none; }
        :host([state="idle"]) .idle-message { display: block; }
        :host([state="idle"]) .content { display: none; }
        :host([state="loading"]) .idle-message { display: none; }
        :host([state="success"]) .idle-message { display: none; }
        :host([state="error"]) .idle-message { display: none; }
        
        .error { display: none; color: #c0392b; }
        .idle-message { display: none; color: var(--color-text, #222); opacity: 0.7; }
        .loading-text { display: none; }
        :host([state="loading"]) .loading-text { display: block; }
        
        ul { list-style: none; padding: 0; }
        li { padding: 8px 0; border-bottom: 1px solid var(--color-border, #999); }
        li:last-child { border-bottom: none; }
        .event-type { font-weight: bold; }
        .event-repo { font-size: 0.9em; opacity: 0.8; }
        .event-time { font-size: 0.8em; opacity: 0.7; }
        
        .retry-btn {
          margin-top: 10px;
          padding: 5px 15px;
          background: var(--color-accent, #333);
          color: var(--color-bg, #fff);
          border: none;
          cursor: pointer;
        }
        .retry-btn:hover { opacity: 0.8; }
        
        .fallback-content { display: block; }
        :host([state="success"]) .fallback-content,
        :host([state="loading"]) .fallback-content,
        :host([state="idle"]) .fallback-content {
          display: none;
        }
        
        .attribution {
          font-size: 0.8em;
          opacity: 0.6;
          margin-top: 10px;
        }
      </style>
      
      <div class="fallback-content">
        <slot>GitHub activity for ${this.username}</slot>
      </div>
      
      <div class="idle-message">Waiting to load GitHub activity...</div>
      <div class="loading-text">Loading GitHub activity...</div>
      
      <div class="error">
        <p><strong>⚠️ Could not load GitHub activity</strong></p>
        <p class="error-message"></p>
        <button class="retry-btn">Retry</button>
      </div>
      
      <div class="content">
        <ul class="activity-list"></ul>
        <div class="attribution">Data from <a href="https://github.com/${this.username}" target="_blank">GitHub</a></div>
      </div>
    `;
    
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    
    // Store references
    this.listElement = this.shadowRoot.querySelector('.activity-list');
    this.errorMessage = this.shadowRoot.querySelector('.error-message');
    this.retryButton = this.shadowRoot.querySelector('.retry-btn');
    
    // Bind retry
    if (this.retryButton) {
      this.retryButton.addEventListener('click', () => this.fetchActivity());
    }
    
    this.setState('idle');
    
    this.cacheKey = `github-activity-${this.username}`;
    this.cacheTTL = 5 * 60 * 1000;
  }
  
  connectedCallback() {
    if (this.username) {
      this.fetchActivity();
    }
  }
  
  disconnectedCallback() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    if (name === 'username') {
      this.username = newValue || 'Fariba-Tokhi';
      this.cacheKey = `github-activity-${this.username}`;
      this.fetchActivity();
    } else if (name === 'limit') {
      this.limit = parseInt(newValue) || 5;
      this.fetchActivity();
    }
  }
  
  getCachedData() {
    try {
      const cached = sessionStorage.getItem(this.cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.timestamp && (Date.now() - data.timestamp) < this.cacheTTL) {
          return data.value;
        }
      }
    } catch (e) {}
    return null;
  }
  
  setCachedData(data) {
    try {
      sessionStorage.setItem(this.cacheKey, JSON.stringify({
        timestamp: Date.now(),
        value: data
      }));
    } catch (e) {}
  }
  
  setState(state, message) {
    this.setAttribute('state', state);
    if (this.errorMessage && message) {
      this.errorMessage.textContent = message;
    }
  }
  
  async fetchActivity() {
    const cached = this.getCachedData();
    if (cached) {
      this.renderActivity(cached);
      this.setState('success');
      return;
    }
    
    if (this.abortController) {
      this.abortController.abort();
    }
    
    this.abortController = new AbortController();
    this.setState('loading');
    
    this.timeoutId = setTimeout(() => {
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
        this.setState('error', 'Request timed out. Please try again.');
      }
    }, 10000);
    
    try {
      const url = `https://api.github.com/users/${encodeURIComponent(this.username)}/events`;
      const response = await fetch(url, {
        signal: this.abortController.signal,
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No activity found for this user');
      }
      
      this.setCachedData(data);
      this.renderActivity(data);
      this.setState('success');
      this.retryCount = 0;
      
    } catch (error) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
      
      if (error.name === 'AbortError') {
        this.setState('error', 'Request was cancelled.');
        return;
      }
      
      this.retryCount++;
      const message = error.message || 'Failed to load GitHub activity';
      this.setState('error', `${message} (attempt ${this.retryCount})`);
      
      if (this.retryCount < this.maxRetries) {
        setTimeout(() => {
          if (this.isConnected) {
            this.fetchActivity();
          }
        }, 2000 * this.retryCount);
      }
    } finally {
      this.abortController = null;
    }
  }
  
  renderActivity(events) {
    if (!this.listElement) return;
    
    // Clear the list safely
    while (this.listElement.firstChild) {
      this.listElement.removeChild(this.listElement.firstChild);
    }
    
    const limited = events.slice(0, this.limit);
    
    if (limited.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No recent activity found.';
      this.listElement.appendChild(li);
      return;
    }
    
    limited.forEach(event => {
      const li = document.createElement('li');
      
      const typeSpan = document.createElement('span');
      typeSpan.className = 'event-type';
      typeSpan.textContent = this.formatEventType(event.type);
      
      const repoSpan = document.createElement('span');
      repoSpan.className = 'event-repo';
      repoSpan.textContent = event.repo ? event.repo.name : 'unknown repo';
      
      const timeSpan = document.createElement('span');
      timeSpan.className = 'event-time';
      timeSpan.textContent = event.created_at ? this.formatTime(event.created_at) : '';
      
      li.appendChild(typeSpan);
      li.appendChild(document.createTextNode(' on '));
      li.appendChild(repoSpan);
      if (event.created_at) {
        li.appendChild(document.createTextNode(' — '));
        li.appendChild(timeSpan);
      }
      
      const details = this.getEventDetails(event);
      if (details) {
        const detailSpan = document.createElement('span');
        detailSpan.className = 'event-details';
        detailSpan.textContent = `: ${details}`;
        li.appendChild(detailSpan);
      }
      
      this.listElement.appendChild(li);
    });
  }
  
  formatEventType(type) {
    const types = {
      'PushEvent': '📦 Pushed',
      'CreateEvent': '✨ Created',
      'DeleteEvent': '🗑️ Deleted',
      'ForkEvent': '🍴 Forked',
      'PullRequestEvent': '🔀 PR',
      'IssuesEvent': '🐛 Issue',
      'WatchEvent': '⭐ Starred',
      'ReleaseEvent': '📦 Released'
    };
    return types[type] || type.replace('Event', '');
  }
  
  formatTime(isoString) {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diff = Math.floor((now - date) / 1000 / 60);
      if (diff < 1) return 'just now';
      if (diff < 60) return `${diff}m ago`;
      if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
      return `${Math.floor(diff / 1440)}d ago`;
    } catch (e) {
      return '';
    }
  }
  
  getEventDetails(event) {
    if (event.type === 'PushEvent') {
      const count = event.payload?.commits?.length || 0;
      return `${count} commit${count !== 1 ? 's' : ''}`;
    }
    if (event.type === 'PullRequestEvent') {
      return event.payload?.action || 'action';
    }
    if (event.type === 'IssuesEvent') {
      return event.payload?.action || 'action';
    }
    if (event.type === 'CreateEvent') {
      return event.payload?.ref_type || 'resource';
    }
    return null;
  }
}

customElements.define('github-activity', GitHubActivity);
