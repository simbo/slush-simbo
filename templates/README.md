<%= projectName %>
<% for (var i=0; i<projectName.length; i++) { %>=<% } %>

<% if (projectLicenseUrl!=='') { %>[<% } %>![<%= projectLicenseType %> License](http://img.shields.io/:license-<%= projectLicenseType.toLowerCase() %>-blue.svg?style=flat-square)<% if (projectLicenseUrl!=='') { %>](<%= projectLicenseUrl%>)<% } %>
[![Dependencies Status](https://img.shields.io/david/<%= authorGithubUser %>/<%= projectName %>.svg?style=flat-square)](https://david-dm.org/<%= authorGithubUser %>/<%= projectName %>)
[![devDependencies Status](https://img.shields.io/david/dev/<%= authorGithubUser %>/<%= projectName %>.svg?style=flat-square)](https://david-dm.org/<%= authorGithubUser %>/<%= projectName %>#info=devDependencies)<% if (optionTravis) { %>
[![Travis Build Status](https://img.shields.io/travis/<%= authorGithubUser %>/<%= projectName %>/master.svg?style=flat-square)](https://travis-ci.org/<%= authorGithubUser %>/<%= projectName %>)<% } %><% if (projectDescription!=='') { %>

  > <%= projectDescription %><% } %>
