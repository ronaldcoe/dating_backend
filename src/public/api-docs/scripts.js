document.addEventListener('DOMContentLoaded', async () => {
  const date = new Date();
  console.log(date.toISOString());
  try {
    const indexResponse = await fetch('/static/api-docs/index.json');
    const apiIndex = await indexResponse.json();
    
    const apiSpec = {
      title: apiIndex.title || 'API Documentation',
      description: apiIndex.description || 'No description available.',
      version: apiIndex.version || '1.0.0',
      basePath: apiIndex.basePath || '/',
      resources: []
    };

    const resourceFiles = [
      'admin.json',
      'auth.json',
      'reset-password.json',
      'users.json',
      'preferences.json',
      'user-interactions.json',
      'reports.json',
      'swipe-queue.json',
      'interests.json',
      'photos.json'
    ];

    const resourcePromises = resourceFiles.map(async (filename) => {
      try {
        const response = await fetch(`/static/api-docs/resources/${filename}`);
        return await response.json();
      } catch (error) {
        console.error(`Failed to load resource file: ${filename}`, error);
        return null;
      }
    });

    const resources = await Promise.all(resourcePromises);

    apiSpec.resources = resources.filter(resource => resource !== null);

    document.getElementById('api-title').textContent = apiSpec.title;
    document.getElementById('api-version').textContent = `v${apiSpec.version}`;
    document.getElementById('api-description').textContent = apiSpec.description;
    document.getElementById('api-base-url').textContent = apiSpec.basePath;

    const sidebarMenu = document.getElementById('sidebar-menu');
    const mainPanel = document.getElementById('main-panel');
    const rightPanel = document.getElementById('right-panel');
    
    if (apiSpec.resources && apiSpec.resources.length > 0) {
      let sidebarHtml = '';
      let mainPanelHtml = '';
      let rightPanelHtml = '';
      
      apiSpec.resources.forEach((resource, resourceIndex) => {
        sidebarHtml += `
          <div class="resource-group" data-resource="${resourceIndex}">
            <div class="resource-title">${resource.title || 'Untitled Resource'}</div>
        `;

        if (resource.routes && resource.routes.length > 0) {
          resource.routes.forEach((endpoint, endpointIndex) => {
            const endpointId = `resource-${resourceIndex}-endpoint-${endpointIndex}`;
            const method = (endpoint.type || 'get').toLowerCase();

            sidebarHtml += `
              <div class="endpoint-link" data-endpoint-id="${endpointId}">
                <span class="endpoint-link-method ${method}">${endpoint.type || 'GET'}</span>
                <span class="endpoint-link-path">${endpoint.path || '/'}</span>
              </div>
            `;

            mainPanelHtml += `
              <div class="endpoint-detail" id="${endpointId}-detail">
                <div class="endpoint-header">
                  <div class="endpoint-title">
                    <span class="method ${method}">${endpoint.type || 'GET'}</span>
                    <span class="endpoint-path">${apiSpec.basePath || ''}${endpoint.path || '/'}</span>
                  </div>
                  <div class="endpoint-description">${endpoint.description || ''}</div>
                </div>
            `;

            // Parameters section
            if (endpoint.parameters && endpoint.parameters.length > 0) {
              mainPanelHtml += `
                <div class="parameters-section">
                  <h3>Parameters</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Required</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
              `;
              
              endpoint.parameters.forEach(param => {
                mainPanelHtml += `
                  <tr>
                    <td>${param.name || ''}</td>
                    <td>${param.type || 'string'}</td>
                    <td>${param.required ? '<span class="required-badge">Required</span>' : 'Optional'}</td>
                    <td>${param.description || ''}</td>
                  </tr>
                `;
              });
              
              mainPanelHtml += `
                    </tbody>
                  </table>
                </div>
              `;
            }

            if (endpoint.headers) {
              mainPanelHtml += `
                <div class="headers-section">
                  <h3>Headers</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Key</th>
                        <th>Value</th>
                        <th>Required</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
              `;
              
              endpoint.headers.forEach(header => {
                mainPanelHtml += `
                  <tr>
                    <td>${header.key || ''}</td>
                    <td>
                      <span class="badge">
                        ${header.value || 'string'}
                      </span>
                    </td>
                    <td>${header.required ? '<span class="required-badge">Required</span>' : 'Optional'}</td>
                    <td>${header.description || ''}</td>
                  </tr>
                `;
              });
              
              mainPanelHtml += `
                    </tbody>
                  </table>
                </div>
              `;
            }

            // Query Params section
            if (endpoint.queryParams && endpoint.queryParams.length > 0) {
              mainPanelHtml += `
                <div class="query-params-section">
                  <h3>Query Parameters</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Key</th>
                        <th>Value</th>
                        <th>Type</th>
                        <th>Required</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
              `;
              
              endpoint.queryParams.forEach(param => {
                mainPanelHtml += `
                  <tr>
                    <td><span class="badge">${param.key || ''}</span></td>
                    <td>
                      <span class="badge">
                        ${param.value || 'string'}
                      </span>
                    </td>
                    <td>${param.type || 'string'}</td>
                    <td>${param.required ? '<span class="required-badge">Required</span>' : 'Optional'}</td>
                    <td>${param.description || ''}</td>
                  </tr>
                `;
              });
              
              mainPanelHtml += `
                    </tbody>
                  </table>
                </div>
              `;
            }

            if (endpoint.requestExample) {
              if (endpoint.requestExample.body) {
                mainPanelHtml += `
                  <div class="body-section">
                    <h3>Request Body</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Key</th>
                          <th>Type</th>
                          <th>Required</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                  `;
              
                endpoint.requestExample.body.forEach(field => {
                  console.log(field);
                  mainPanelHtml += `
                    <tr>
                      <td>${field.key || ''}</td>
                      <td>
                        <span class="badge">
                          ${field.type || 'string'}
                        </span>
                      </td>
                      <td>${field.required ? '<span class="required-badge">Required</span>' : 'Optional'}</td>
                      <td>${field.description || ''}</td>
                    </tr>

                  `;
                });
                mainPanelHtml += `
                      </tbody>
                    </table>
                  </div>
                `;
             }

              mainPanelHtml += `
                <div class="request-section">
                  <h3>Request Example</h3>
                   
              `;
              
              const requestExample = {};
              if (endpoint.requestExample.body && endpoint.requestExample.body.length > 0) {
                endpoint.requestExample.body.forEach(param => {
                  if (param.value !== undefined) {
                    requestExample[param.key] = param.value;
                  } else if (param.type === 'object') {
                    requestExample[param.key] = {};
                  } else if (param.type === 'array') {
                    requestExample[param.key] = [];
                  } else if (param.type === 'number' || param.type === 'integer') {
                    requestExample[param.key] = 0;
                  } else if (param.type === 'boolean') {
                    requestExample[param.key] = false;
                  } else {
                    requestExample[param.key] = "";
                  }
                });
              }
              
              mainPanelHtml += `
                <div class="code-sample">
                  <p>${endpoint.type} ${endpoint.requestExample.url}</p>
                  ${endpoint.requestExample.body !== undefined 
                    ? `<pre><code>${JSON.stringify(requestExample, null, 2)}</code></pre>` 
                    : ''}
                  </div>
                </div>`;

            }
            
            // Responses section 
            if (endpoint.responses) {
              mainPanelHtml += `
                <div class="responses-section">
                  <h3>Response Codes</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
              `;
              
              Object.entries(endpoint.responses).forEach(([code, response]) => {
                mainPanelHtml += `
                  <tr>
                    <td><span class="status-code status-${code.charAt(0)}xx">${code}</span></td>
                    <td>${response.description || ''}</td>
                  </tr>
                `;
              });
              
              mainPanelHtml += `
                    </tbody>
                  </table>
                </div>
              `;
            }
            
            mainPanelHtml += `</div>`;

            rightPanelHtml += `
              <div class="response-panel-content" id="${endpointId}-response">
            `;

            if (endpoint.responses) {
              rightPanelHtml += `<div class="response-tabs">`;

              Object.keys(endpoint.responses).forEach((code, index) => {
                rightPanelHtml += `
                  <button class="response-tab ${index === 0 ? 'active' : ''}" 
                    data-code="${code}" 
                    data-endpoint="${endpointId}">
                    ${code} ${endpoint.responses[code].description}
                  </button>
                `;
              });
              
              rightPanelHtml += `</div>`;

              Object.entries(endpoint.responses).forEach(([code, response], index) => {
                rightPanelHtml += `
                  <div class="response-content ${index === 0 ? 'active' : ''}" 
                    id="${endpointId}-response-${code}">
                    <pre><code>${JSON.stringify(response.content || {}, null, 2)}</code></pre>
                  </div>
                `;
              });
            } else {
              // Generic response if nothing is provided
              const sampleResponse = {
                success: true,
                message: 'Operation completed successfully'
              };
              
              if (endpoint.type === 'GET') {
                sampleResponse.data = { sample: 'data' };
              } else if (endpoint.type === 'DELETE') {
                sampleResponse.message = 'Resource deleted successfully';
              }
              
              rightPanelHtml += `
                <pre><code>${JSON.stringify(sampleResponse, null, 2)}</code></pre>
              `;
            }
            
            rightPanelHtml += `</div>`;
          });
        }
        
        sidebarHtml += `</div>`;
      });
      
      sidebarMenu.innerHTML = sidebarHtml;

      const welcomeDiv = mainPanel.querySelector('.endpoint-welcome');
      mainPanel.innerHTML = '';
      if (welcomeDiv) {
        mainPanel.appendChild(welcomeDiv);
      }
      mainPanel.innerHTML += mainPanelHtml;

      const responseWelcomeDiv = rightPanel.querySelector('.response-welcome');
      rightPanel.innerHTML = '';
      if (responseWelcomeDiv) {
        rightPanel.appendChild(responseWelcomeDiv);
      }
      rightPanel.innerHTML += rightPanelHtml;

      document.querySelectorAll('.endpoint-link').forEach(link => {
        link.addEventListener('click', () => {
          const endpointId = link.getAttribute('data-endpoint-id');

          const welcomeElem = document.querySelector('.endpoint-welcome');
          const responseWelcomeElem = document.querySelector('.response-welcome');
          
          if (welcomeElem) welcomeElem.style.display = 'none';
          if (responseWelcomeElem) responseWelcomeElem.style.display = 'none';

          document.querySelectorAll('.endpoint-detail').forEach(el => el.classList.remove('active'));
          document.querySelectorAll('.response-panel-content').forEach(el => el.classList.remove('active'));
          document.querySelectorAll('.endpoint-link').forEach(el => el.classList.remove('active'));

          const detailElem = document.getElementById(`${endpointId}-detail`);
          const responseElem = document.getElementById(`${endpointId}-response`);
          
          if (detailElem) detailElem.classList.add('active');
          if (responseElem) responseElem.classList.add('active');
          link.classList.add('active');
        });
      });

      document.querySelectorAll('.response-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const code = tab.getAttribute('data-code');
          const endpointId = tab.getAttribute('data-endpoint');

          document.querySelectorAll(`.response-tab[data-endpoint="${endpointId}"]`).forEach(t => 
            t.classList.remove('active'));
          document.querySelectorAll(`[id^="${endpointId}-response-"]`).forEach(c => 
            c.classList.remove('active'));

          tab.classList.add('active');
          const responseContentElem = document.getElementById(`${endpointId}-response-${code}`);
          if (responseContentElem) responseContentElem.classList.add('active');
        });
      });

      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          const searchTerm = searchInput.value.toLowerCase();
          
          document.querySelectorAll('.endpoint-link').forEach(link => {
            const method = link.querySelector('.endpoint-link-method').textContent.toLowerCase();
            const path = link.querySelector('.endpoint-link-path').textContent.toLowerCase();
            
            if (method.includes(searchTerm) || path.includes(searchTerm)) {
              link.style.display = 'flex';

              const resourceGroup = link.closest('.resource-group');
              if (resourceGroup) resourceGroup.style.display = 'block';
            } else {
              link.style.display = 'none';
            }
          });

          document.querySelectorAll('.resource-group').forEach(group => {
            const visibleEndpoints = group.querySelectorAll('.endpoint-link[style="display: flex"]').length;
            if (visibleEndpoints === 0) {
              group.style.display = 'none';
            }
          });
        });
      }
    } else {
      sidebarMenu.innerHTML = '<div style="padding: 15px;">No API resources defined.</div>';
    }
  } catch (error) {
    console.error('Error loading API spec:', error);
    document.getElementById('api-description').textContent = 'Error loading API documentation. Please try again later.';
  }
});