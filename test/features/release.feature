Feature: Release preparation
  Scenario: Versioning pushes a GitHub release tag and versioned CDN files without publishing to npm
    Then npm version builds and pushes a tag and CDN files without npm authentication
