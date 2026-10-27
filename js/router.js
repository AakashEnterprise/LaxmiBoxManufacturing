/**
 * PackFlow ERP - Client-Side Hash Router
 * Routes URL hash changes to corresponding view controllers, breadcrumbs, and active navigation states.
 */

class PackFlowRouter {
  constructor() {
    this.routes = {};
    window.addEventListener("hashchange", () => this.handleRoute());
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  init() {
    if (!window.location.hash) {
      window.location.hash = "#/dashboard";
    } else {
      this.handleRoute();
    }
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || "/dashboard";
    const [pathPart, queryPart] = hash.split("?");
    const segments = pathPart.split("/").filter(Boolean);

    const mainContainer = document.getElementById("appMainContent");
    if (!mainContainer) return;

    // Scroll to top
    window.scrollTo(0, 0);

    // Update active state in sidebar
    document.querySelectorAll(".nav-item").forEach(item => {
      const itemHash = item.getAttribute("href")?.slice(1) || "";
      if (itemHash === pathPart || (itemHash && pathPart.startsWith(itemHash) && itemHash !== "/dashboard")) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Close mobile drawer on route change
    document.querySelector(".app-sidebar")?.classList.remove("mobile-open");
    document.querySelector(".sidebar-backdrop")?.classList.remove("mobile-open");

    // Match route handler
    let handler = this.routes[pathPart];
    let params = {};

    if (!handler) {
      // Dynamic route matching (e.g. /customers/:id or /sales-orders/:id)
      for (const pattern in this.routes) {
        const patternSegments = pattern.split("/").filter(Boolean);
        if (patternSegments.length === segments.length) {
          let match = true;
          const extractedParams = {};
          for (let i = 0; i < patternSegments.length; i++) {
            if (patternSegments[i].startsWith(":")) {
              extractedParams[patternSegments[i].slice(1)] = segments[i];
            } else if (patternSegments[i] !== segments[i]) {
              match = false;
              break;
            }
          }
          if (match) {
            handler = this.routes[pattern];
            params = extractedParams;
            break;
          }
        }
      }
    }

    if (handler) {
      try {
        const html = handler(params, queryPart);
        mainContainer.innerHTML = html;
      } catch (err) {
        console.error("Router error rendering route:", err);
        mainContainer.innerHTML = `
          <div class="card empty-state">
            <span class="material-symbols-outlined empty-state-icon text-error">error</span>
            <h3 class="empty-state-title">Error Loading View</h3>
            <p class="empty-state-text">${err.message}</p>
            <button class="btn btn-primary" onclick="location.hash='#/dashboard'">Return to Dashboard</button>
          </div>
        `;
      }
    } else {
      mainContainer.innerHTML = `
        <div class="card empty-state">
          <span class="material-symbols-outlined empty-state-icon text-primary">explore_off</span>
          <h3 class="empty-state-title">Page Not Found</h3>
          <p class="empty-state-text">The requested route <strong>${hash}</strong> does not exist in PackFlow ERP.</p>
          <button class="btn btn-primary" onclick="location.hash='#/dashboard'">Return to Executive Dashboard</button>
        </div>
      `;
    }
  }
}

window.PackFlowRouter = new PackFlowRouter();
