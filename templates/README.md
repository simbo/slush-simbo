<%= project.name %>
<% for (var i=0; i<project.name.length; i++) { %>=<% } %>

<% if (license.url!=='') { %>[<% } %>![<%= license.type %> License](http://img.shields.io/:license-<%= license.type.toLowerCase() %>-blue.svg?style=flat-square)<% if (license.url!=='') { %>](<%= license.url%>)<% } %>
[![Dependencies Status](https://img.shields.io/david/<%= author.githubUser %>/<%= project.name %>.svg?style=flat-square)](https://david-dm.org/<%= author.githubUser %>/<%= project.name %>)
[![devDependencies Status](https://img.shields.io/david/dev/<%= author.githubUser %>/<%= project.name %>.svg?style=flat-square)](https://david-dm.org/<%= author.githubUser %>/<%= project.name %>#info=devDependencies)<% if (options.supportTravis) { %>
[![Travis Build Status](https://img.shields.io/travis/<%= author.githubUser %>/<%= project.name %>/master.svg?style=flat-square)](https://travis-ci.org/<%= author.githubUser %>/<%= project.name %>)<% } %><% if (project.description!=='') { %>

  > <%= project.description %><% } %>
