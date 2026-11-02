```{=html}
<!-- Share publication layout classes so both listings use the same spacing and thumbnails. -->
<div class="catalogue-list publication-list project-list list">
  <% for (const item of items) { %>
  <div class="catalogue-item publication-item<%= item['image-layout'] === 'wide' ? ' project-item--wide-image' : '' %>" <%= metadataAttrs(item) %>>
    <h3 class="listing-title"><%- item.title %></h3>
    <div class="catalogue-entry-body publication-entry-body">
      <div class="catalogue-entry-details publication-entry-details">
        <p class="catalogue-entry-meta publication-author"><%- item['description-line-1'] %></p>
        <p class="catalogue-entry-meta publication-citation"><%- item['description-line-2'] %></p>
        <div class="catalogue-entry-links publication-links">
          <a href="<%- item['project-url'] %>" class="btn btn-primary btn-sm icon-link icon-<%- item['button-icon'] || 'project' %>"><%- item['button-text'] || 'Explore Project' %></a>
        </div>
      </div>
      <% if (item.image) { %>
      <div class="catalogue-entry-image publication-entry-image">
        <div class="project-thumbnail"<% if (item['image-credit']) { %> tabindex="0" aria-label="Image credit: <%- item['image-credit'] %>"<% } %>>
          <img src="<%- item.image %>" alt="<%- item['image-alt'] || item.title %>" loading="lazy" decoding="async">
          <% if (item['image-credit']) { %>
          <div class="project-image-attribution">
            <span><%- item['image-credit'] %></span>
            <% if (item['image-source-url']) { %>
            <a href="<%- item['image-source-url'] %>">View CERN source</a>
            <% } %>
          </div>
          <% } %>
        </div>
      </div>
      <% } %>
    </div>
  </div>
  <% } %>
</div>
```
