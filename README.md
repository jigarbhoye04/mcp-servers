# MCP Server

In this we have created a simple MCP(Model Context Protocol).

## Output:

![Sample Image](/public/1.png)


## Some More example prompts to try out:

> ### WeatherInfo Tool

**Prompt Examples:**
- "What's the weather like in Tokyo?"
- "Tell me the temperature in New York in Fahrenheit"
- "Is it raining in London right now?"


**Test Cases:**
```javascript
// Test case 1: Known location in default units (Celsius)
await WeatherInfo({
  location: "Tokyo"
});
// Expected result: Tokyo weather in Celsius

// Test case 2: Known location with Fahrenheit units
await WeatherInfo({
  location: "New York",
  unit: "fahrenheit"
});
// Expected result: New York weather with temperature in Fahrenheit

// Test case 3: Another known location
await WeatherInfo({
  location: "London"
});
// Expected result: London weather data

// Test case 4: Unknown location (should generate random weather)
await WeatherInfo({
  location: "Atlantis"
});
// Expected result: Generated weather data for unknown location
``` 