```{=html}
<div class="catalogue-list list">
  <% for (const group of [{type: "Talk", label: "Talks"}, {type: "Poster", label: "Posters"}]) { %>
  <section class="catalogue-section" aria-labelledby="<%= group.type.toLowerCase() %>-heading">
    <h2 id="<%= group.type.toLowerCase() %>-heading"><%= group.label %></h2>
    <% for (const item of items.filter(item => item.type === group.type)) { %>
    <div class="catalogue-item<%= item['logo-layout'] === 'banner' ? ' catalogue-item--banner' : '' %>" <%= metadataAttrs(item) %>>
      <h3 class="listing-title"><%= item.title %></h3>
      <div class="catalogue-entry-body">
        <div class="catalogue-entry-details">
          <p class="catalogue-entry-meta"><strong><%= item.conference %></strong></p>
          <p class="catalogue-entry-meta">
            <%= item.location %> ·
            <%= new Date(item.date).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric", timeZone: "UTC"
            }) %>
          </p>
          <div class="catalogue-entry-links">
            <% if (item['page-url']) { %>
            <a href="<%- item['page-url'] %>" class="btn btn-primary btn-sm icon-link icon-<%= group.type === 'Talk' ? 'talk' : 'poster' %>"><%= group.type %> Summary</a>
            <% } %>
            <% if (item['conference-url'] && item['conference-short']) { %>
            <a href="<%- item['conference-url'] %>" class="btn btn-outline-primary btn-sm icon-link icon-conference"><%= item['conference-short'] %></a>
            <% } %>
          </div>
        </div>
        <% if (item.logo) { %>
        <div class="catalogue-entry-image">
          <img src="<%- item.logo %>"
               alt="<%- item['logo-alt'] || item['conference-short'] || item.conference %>"
               loading="lazy" decoding="async">
        </div>
        <% } %>
      </div>
    </div>
    <% } %>
  </section>
  <% } %>
</div>
```
