Feature: Google Maps layer compatibility
  Scenario Outline: Google layers work with supported Leaflet versions
    Then the "<bundle>" bundle synchronizes a Google map with Leaflet "<version>"

    Examples:
      | bundle   | version      |
      | readable | 1.9.4        |
      | minified | 1.9.4        |
      | readable | 2.0.0-beta.3 |
      | minified | 2.0.0-beta.3 |
