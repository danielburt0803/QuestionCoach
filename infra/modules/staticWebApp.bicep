param location string
param swaName string
param environment string

resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: swaName
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {}
  tags: {
    environment: environment
    application: 'QuestionCoach'
  }
}

output swaName string = staticWebApp.name
output swaHostname string = staticWebApp.properties.defaultHostname
