```{=html}
<div class="presentation-list list">

    <h2>Talks</h2>

    <% for (const item of items.filter(item => item.type === "Talk")) { %>

    <div class="presentation-item" <%= metadataAttrs(item) %>>

        <h3 class="listing-title"><%= item.title %></h3>

        <p class="presentation-conference">
        <strong><%= item.conference %></strong>
        </p>

        <p class="presentation-meta">
        <%= item.location %> ·
        <%= new Date(item.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC"
        }) %>
        </p>

        <div class="presentation-links">

            <% if (item['page-url']) { %>
            <a href="<%= item['page-url'] %>" class="btn btn-primary btn-sm">
            Talk Summary
            </a>
            <% } %>

            <% if (item['conference-url'] && item['conference-short']) { %>
            <a href="<%= item['conference-url'] %>" class="btn btn-outline-primary btn-sm">
            <%= item['conference-short'] %>
            </a>
            <% } %>

        </div>

    </div>

    <% } %>


    <h2>Posters</h2>

    <% for (const item of items.filter(item => item.type === "Poster")) { %>

    <div class="presentation-item" <%= metadataAttrs(item) %>>

        <h3 class="listing-title"><%= item.title %></h3>

        <p class="presentation-conference">
        <strong><%= item.conference %></strong>
        </p>

        <p class="presentation-meta">
        <%= item.location %> ·
        <%= new Date(item.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC"
        }) %>
        </p>

        <div class="presentation-links">

            <% if (item['page-url']) { %>
            <a href="<%= item['page-url'] %>" class="btn btn-primary btn-sm">
            Poster Summary
            </a>
            <% } %>

            <% if (item['conference-url'] && item['conference-short']) { %>
            <a href="<%= item['conference-url'] %>" class="btn btn-outline-primary btn-sm">
            <%= item['conference-short'] %>
            </a>
            <% } %>

        </div>

    </div>

    <% } %>

</div>
```