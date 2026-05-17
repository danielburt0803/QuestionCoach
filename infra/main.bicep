@description('Deployment environment (dev, test, prod)')
param environment string = 'dev'

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Suffix to ensure globally unique resource names')
param uniqueSuffix string = uniqueString(resourceGroup().id)

var swaName = 'qcoach-swa-${environment}-${uniqueSuffix}'
var cosmosDbAccountName = 'qcoach-cosmos-${environment}-${uniqueSuffix}'
var storageAccountName = 'qcoach${environment}${take(uniqueSuffix, 8)}'

module swa 'modules/staticWebApp.bicep' = {
  name: 'staticWebApp'
  params: {
    location: location
    swaName: swaName
    environment: environment
  }
}

module cosmosDb 'modules/cosmosDb.bicep' = {
  name: 'cosmosDb'
  params: {
    location: location
    cosmosDbAccountName: cosmosDbAccountName
    environment: environment
  }
}

module storage 'modules/storage.bicep' = {
  name: 'storage'
  params: {
    location: location
    storageAccountName: storageAccountName
    environment: environment
  }
}

output swaHostname string = swa.outputs.swaHostname
output cosmosEndpoint string = cosmosDb.outputs.cosmosEndpoint
output questionsContainerUrl string = storage.outputs.questionsContainerUrl
output storageAccountName string = storage.outputs.storageAccountName
output cosmosAccountName string = cosmosDb.outputs.cosmosAccountName
output swaName string = swa.outputs.swaName
