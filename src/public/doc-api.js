document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Fetch the API spec
    const response = await fetch('/static/api-spec.json');
    const apiSpec = await response.json();
    
    // Update API info
    document.getElementById('api-title').textContent = apiSpec.title || 'API Documentation';
    document.getElementById('api-version').textContent = `v${apiSpec.version || '1.0.0'}`;
    document.getElementById('api-description').textContent = apiSpec.description || 'No description available.';
    document.getElementById('api-base-url').textContent = apiSpec.basePath || '/';
    
    // Render sidebar menu
    const sidebarMenu = document.getElementById('sidebar-menu');
    const mainPanel = document.getElementById('main-panel');
    const rightPanel = document.getElementById('right-panel');
    
    if (apiSpec.resources && apiSpec.resources.length > 0) {
      let sidebarHtml = '';
      let mainPanelHtml = '';
      let rightPanelHtml = '';
      
      apiSpec.resources.forEach((resource, resourceIndex) => {
        // Add resource to sidebar
        sidebarHtml += `
          <div class="resource-group" data-resource="${resourceIndex}">
            <div class="resource-title">${resource.title || 'Untitled Resource'}</div>
        `;
        
        // Add endpoints under this resource
        if (resource.routes && resource.routes.length > 0) {
          resource.routes.forEach((endpoint, endpointIndex) => {
            const endpointId = `resource-${resourceIndex}-endpoint-${endpointIndex}`;
            const method = (endpoint.type || 'get').toLowerCase();
            
            // Add endpoint to sidebar
            sidebarHtml += `
              <div class="endpoint-link" data-endpoint-id="${endpointId}">
                <span class="endpoint-link-method ${method}">${endpoint.type || 'GET'}</span>
                <span class="endpoint-link-path">${endpoint.path || '/'}</span>
              </div>
            `;
            
            // Create main panel content for this endpoint
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

            if (endpoint.body) {
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
              
              endpoint.body.forEach(field => {
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
            
            // Request example (only for POST, PUT, PATCH)
            if (endpoint.body && endpoint.body.length > 0 && 
                ['POST', 'PUT', 'PATCH'].includes((endpoint.type || '').toUpperCase())) {
              mainPanelHtml += `
                <div class="request-section">
                  <h3>Request Example</h3>
                   
              `;
              
              const requestExample = {};
              endpoint.body.forEach(param => {
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
              
              mainPanelHtml += `
                  <div class="code-sample">
                    <p>${endpoint.type} ${endpoint.path}</p>
                    <pre><code>${JSON.stringify(requestExample, null, 2)}</code></pre>
                  </div>
                </div>
              `;
            }
            
            // Responses section (new)
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
            
            // Create right panel content (response examples)
            rightPanelHtml += `
              <div class="response-panel-content" id="${endpointId}-response">
            `;
            
            // Display different response examples based on status codes
            if (endpoint.responses) {
              rightPanelHtml += `<div class="response-tabs">`;
              
              // Create tabs for each response code
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
              
              // Create tab content panels for each response
              Object.entries(endpoint.responses).forEach(([code, response], index) => {
                let exampleResponse;
                
                if (code.startsWith('2')) {
                  // For successful responses, use the provided example if available
                  exampleResponse = endpoint.response || {
                    success: true,
                    message: response.description,
                    data: {}
                  };
                } else {
                  // For error responses, use the schema example if available
                  exampleResponse = {
                    success: false,
                    message: response.description
                  };
                  
                  // Add example error details if provided in the schema
                  if (response.schema && response.schema.properties) {
                    Object.entries(response.schema.properties).forEach(([key, prop]) => {
                      if (prop.example) {
                        exampleResponse[key] = prop.example;
                      }
                    });
                  }
                }
                
                rightPanelHtml += `
                  <div class="response-content ${index === 0 ? 'active' : ''}" 
                    id="${endpointId}-response-${code}">
                    <pre><code>${JSON.stringify(exampleResponse, null, 2)}</code></pre>
                  </div>
                `;
              });
            } else if (endpoint.response) {
              // Fallback to the old response format if no responses object is provided
              rightPanelHtml += `
                <pre><code>${JSON.stringify(endpoint.response, null, 2)}</code></pre>
              `;
            } else {
              // Generic response if nothing is provided
              const sampleResponse = {};
              sampleResponse.success = true;
              sampleResponse.message = 'Operation completed successfully';
              
              if (endpoint.type === 'GET') {
                sampleResponse.data = { sample: 'data' };
              } else if (endpoint.type === 'DELETE') {
                sampleResponse.success = true;
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
      
      // Add endpoint details to main panel (after welcome message)
      const welcomeDiv = mainPanel.querySelector('.endpoint-welcome');
      mainPanel.innerHTML = '';
      if (welcomeDiv) {
        mainPanel.appendChild(welcomeDiv);
      }
      mainPanel.innerHTML += mainPanelHtml;
      
      // Add response examples to right panel (after welcome message)
      const responseWelcomeDiv = rightPanel.querySelector('.response-welcome');
      rightPanel.innerHTML = '';
      if (responseWelcomeDiv) {
        rightPanel.appendChild(responseWelcomeDiv);
      }
      rightPanel.innerHTML += rightPanelHtml;
      
      // Add click event listeners to sidebar endpoint links
      document.querySelectorAll('.endpoint-link').forEach(link => {
        link.addEventListener('click', () => {
          const endpointId = link.getAttribute('data-endpoint-id');
          
          // Hide welcome messages
          const welcomeElem = document.querySelector('.endpoint-welcome');
          const responseWelcomeElem = document.querySelector('.response-welcome');
          
          if (welcomeElem) welcomeElem.style.display = 'none';
          if (responseWelcomeElem) responseWelcomeElem.style.display = 'none';
          
          // Deactivate all endpoints and sidebar links
          document.querySelectorAll('.endpoint-detail').forEach(el => el.classList.remove('active'));
          document.querySelectorAll('.response-panel-content').forEach(el => el.classList.remove('active'));
          document.querySelectorAll('.endpoint-link').forEach(el => el.classList.remove('active'));
          
          // Activate the selected endpoint
          const detailElem = document.getElementById(`${endpointId}-detail`);
          const responseElem = document.getElementById(`${endpointId}-response`);
          
          if (detailElem) detailElem.classList.add('active');
          if (responseElem) responseElem.classList.add('active');
          link.classList.add('active');
        });
      });
      
      // Add click event listeners to response tabs
      document.querySelectorAll('.response-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const code = tab.getAttribute('data-code');
          const endpointId = tab.getAttribute('data-endpoint');
          
          // Deactivate all tabs and response content panels for this endpoint
          document.querySelectorAll(`.response-tab[data-endpoint="${endpointId}"]`).forEach(t => 
            t.classList.remove('active'));
          document.querySelectorAll(`[id^="${endpointId}-response-"]`).forEach(c => 
            c.classList.remove('active'));
          
          // Activate the selected tab and content
          tab.classList.add('active');
          const responseContentElem = document.getElementById(`${endpointId}-response-${code}`);
          if (responseContentElem) responseContentElem.classList.add('active');
        });
      });
      
      // Setup search functionality
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          const searchTerm = searchInput.value.toLowerCase();
          
          document.querySelectorAll('.endpoint-link').forEach(link => {
            const method = link.querySelector('.endpoint-link-method').textContent.toLowerCase();
            const path = link.querySelector('.endpoint-link-path').textContent.toLowerCase();
            
            if (method.includes(searchTerm) || path.includes(searchTerm)) {
              link.style.display = 'flex';
              
              // Make sure the resource group is also visible
              const resourceGroup = link.closest('.resource-group');
              if (resourceGroup) resourceGroup.style.display = 'block';
            } else {
              link.style.display = 'none';
            }
          });
          
          // Hide empty resource groups
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
    
    // Add CSS for status codes
    const style = document.createElement('style');
    style.textContent = `
      .status-code {
        padding: 3px 6px;
        border-radius: 4px;
        font-weight: bold;
        color: white;
      }
      .status-2xx {
        background-color: #4CAF50; /* Green */
      }
      .status-3xx {
        background-color: #2196F3; /* Blue */
      }
      .status-4xx {
        background-color: #FF9800; /* Orange */
      }
      .status-5xx {
        background-color: #F44336; /* Red */
      }
      .response-tabs {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 10px;
      }
      .response-tab {
        padding: 8px 12px;
        margin-right: 5px;
        margin-bottom: 5px;
        border: 1px solid #ddd;
        background: #f5f5f5;
        cursor: pointer;
        border-radius: 4px;
        font-size: 13px;
      }
      .response-tab.active {
        background: #e0e0e0;
        border-color: #bbb;
        font-weight: bold;
      }
      .response-content {
        display: none;
      }
      .response-content.active {
        display: block;
      }
      .badge {
        background-color: #f0f0f0;
        border-radius: 3px;
        padding: 2px 5px;
        font-size: 12px;
        font-family: monospace;
      }
      .required-badge {
        background-color: #ff9800;
        color: white;
        border-radius: 3px;
        padding: 2px 5px;
        font-size: 11px;
      }
    `;
    document.head.appendChild(style);
  } catch (error) {
    console.error('Error loading API spec:', error);
    document.getElementById('api-description').textContent = 'Error loading API documentation. Please try again later.';
  }
});