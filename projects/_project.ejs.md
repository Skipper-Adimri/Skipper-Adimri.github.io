```{=html}
<!-- Share publication layout classes so both listings use the same spacing and thumbnails. -->
<div class="publication-list project-list list">
  <% for (const item of items) { %>
  <div class="publication-item" <%= metadataAttrs(item) %>>
    <h3 class="listing-title"><%- item.title %></h3>
    <div class="publication-entry-body">
      <div class="publication-entry-details">
        <p class="publication-author"><%- item['description-line-1'] %></p>
        <p class="publication-citation"><%- item['description-line-2'] %></p>
        <div class="publication-links">
          <a href="<%- item['project-url'] %>" class="btn btn-primary btn-sm"><%- item['button-text'] || 'Explore Project' %></a>
        </div>
      </div>
      <% if (item.image) { %>
      <div class="publication-entry-image">
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
