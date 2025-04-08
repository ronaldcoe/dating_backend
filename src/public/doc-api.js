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
              console.log('Headers:', endpoint.headers);
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
                    <td>${header.required ? '<span class="required-badge">Required</span>' : ''}</td>
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
              console.log('Headers:', endpoint.body);
              mainPanelHtml += `
                <div class="headers-section">
                  <h3>Body</h3>
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
              
              endpoint.body.forEach(header => {
                mainPanelHtml += `
                  <tr>
                    <td>${header.key || ''}</td>
                    <td>
                      <span class="badge">
                        ${header.type || 'string'}
                      </span>
                    </td>
                    <td>${header.required ? '<span class="required-badge">Required</span>' : ''}</td>
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
            
            // Request example (only for POST, PUT, PATCH)
            if (endpoint.body && endpoint.body.length > 0 && 
                ['POST', 'PUT', 'PATCH'].includes((endpoint.type || '').toUpperCase())) {
              mainPanelHtml += `
                <div class="request-section">
                  <h3>Request Example</h3>
                   
              `;
              
              const requestExample = {};
              endpoint.body.forEach(param => {
                if (param.type === 'object') {
                  requestExample[param.key] = {};
                } else if (param.type === 'array') {
                  requestExample[param.key] = [];
                } else if (param.type === 'number') {
                  requestExample[param.key] = 0;
                } else if (param.type === 'boolean') {
                  requestExample[param.key] = false;
                } else {
                  requestExample[param.key] = `${param.value}`;
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
            
            mainPanelHtml += `</div>`;
            
            // Create right panel content (response examples)
            rightPanelHtml += `
              <div class="response-panel-content" id="${endpointId}-response">
            `;
            
            // Create a sample response based on endpoint type
            let sampleResponse = {};
            if (['GET', 'POST', 'PUT', 'PATCH'].includes((endpoint.type || '').toUpperCase())) {
              if (endpoint.response) {
                console.log('Sample response:', endpoint.response);
                sampleResponse = endpoint.response;
              } else {
                sampleResponse.success = true;
                sampleResponse.message = 'Operation completed successfully';
                
                // For GET requests, add a data field with sample data
                if (endpoint.type === 'GET') {
                  sampleResponse.data = { sample: 'data' };
                }
              }
            } else if (endpoint.type === 'DELETE') {
              sampleResponse.success = true;
              sampleResponse.message = 'Resource deleted successfully';
            }
            
            rightPanelHtml += `
                <pre><code>${JSON.stringify(sampleResponse, null, 2)}</code></pre>
              </div>
            `;
          });
        }
        
        sidebarHtml += `</div>`;
      });
      
      sidebarMenu.innerHTML = sidebarHtml;
      
      // Add endpoint details to main panel (after welcome message)
      const welcomeDiv = mainPanel.querySelector('.endpoint-welcome');
      mainPanel.innerHTML = '';
      mainPanel.appendChild(welcomeDiv);
      mainPanel.innerHTML += mainPanelHtml;
      
      // Add response examples to right panel (after welcome message)
      const responseWelcomeDiv = rightPanel.querySelector('.response-welcome');
      rightPanel.innerHTML = '';
      rightPanel.appendChild(responseWelcomeDiv);
      rightPanel.innerHTML += rightPanelHtml;
      
      // Add click event listeners to sidebar endpoint links
      document.querySelectorAll('.endpoint-link').forEach(link => {
        link.addEventListener('click', () => {
          const endpointId = link.getAttribute('data-endpoint-id');
          
          // Hide welcome messages
          document.querySelector('.endpoint-welcome').style.display = 'none';
          document.querySelector('.response-welcome').style.display = 'none';
          
          // Deactivate all endpoints and sidebar links
          document.querySelectorAll('.endpoint-detail').forEach(el => el.classList.remove('active'));
          document.querySelectorAll('.response-panel-content').forEach(el => el.classList.remove('active'));
          document.querySelectorAll('.endpoint-link').forEach(el => el.classList.remove('active'));
          
          // Activate the selected endpoint
          document.getElementById(`${endpointId}-detail`).classList.add('active');
          document.getElementById(`${endpointId}-response`).classList.add('active');
          link.classList.add('active');
        });
      });
      
      // Setup search functionality
      const searchInput = document.getElementById('search-input');
      searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        
        document.querySelectorAll('.endpoint-link').forEach(link => {
          const method = link.querySelector('.endpoint-link-method').textContent.toLowerCase();
          const path = link.querySelector('.endpoint-link-path').textContent.toLowerCase();
          
          if (method.includes(searchTerm) || path.includes(searchTerm)) {
            link.style.display = 'flex';
            
            // Make sure the resource group is also visible
            const resourceGroup = link.closest('.resource-group');
            resourceGroup.style.display = 'block';
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
    } else {
      sidebarMenu.innerHTML = '<div style="padding: 15px;">No API resources defined.</div>';
    }
  } catch (error) {
    console.error('Error loading API spec:', error);
    document.getElementById('api-description').textContent = 'Error loading API documentation. Please try again later.';
  }
});