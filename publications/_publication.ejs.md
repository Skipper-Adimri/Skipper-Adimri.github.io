```{=html}
<div class="publication-list list">
    <% for (const item of items) { %>

    <div class="publication-item" <%= metadataAttrs(item) %>>

        <h3 class="listing-title">
        <% if (item['title-html']) { %>
        <%= item['title-html'] %>
        <% } else { %>
        <%- item.title %>
        <% } %>
        </h3>

        <p class="publication-author">
        <strong><%= item.author %></strong>
        </p>

        <p class="publication-citation">
        <em><%= item.journal %></em>
        <% if (item.volume) { %>
        <strong><%= item.volume %></strong>,
        <% } %>
        <% if (item.article) { %>
        <%= item.article %>
        <% } %>
        <% if (item.year) { %>
        (<%= item.year %>)
        <% } %>
        </p>

        <div class="publication-links">

            <% if (item['journal-url'] && item['journal-short']) { %>
            <a href="<%= item['journal-url'] %>" class="btn btn-primary btn-sm">
            <%= item['journal-short'] %>
            </a>
            <% } %>

            <% if (item['project-url']) { %>
            <a href="<%= item['project-url'] %>" class="btn btn-outline-primary btn-sm">
            Project Summary
            </a>
            <% } %>

            <% if (item['arxiv-url']) { %>
            <a href="<%= item['arxiv-url'] %>" class="btn btn-outline-primary btn-sm">
            arXiv
            </a>
            <% } %>

        </div>

    </div>

    <% } %>
</div>
```