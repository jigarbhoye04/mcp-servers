import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "jigx-advanced-mcp",
  version: "1.0.0",
});


// Weather information tool with geolocation
server.tool(
  "WeatherInfo",
  {
    location: z.string(),
    unit: z.enum(["celsius", "fahrenheit"]).optional().default("celsius"),
  },
  async ({ location, unit }) => {
    try {
      // Mock weather data for demonstration purposes
      const weatherDatabase = {
        "new york": { temp: 15, condition: "Cloudy", humidity: 65, wind: 12 },
        "london": { temp: 12, condition: "Rainy", humidity: 80, wind: 15 },
        "tokyo": { temp: 20, condition: "Sunny", humidity: 50, wind: 8 },
        "sydney": { temp: 25, condition: "Clear", humidity: 45, wind: 10 },
        "paris": { temp: 14, condition: "Partly Cloudy", humidity: 60, wind: 11 },
      };
      
      const locationLower = location.toLowerCase();
      let weather;
      
      if (weatherDatabase[locationLower]) {
        weather = { ...weatherDatabase[locationLower] };
      } else {
        // Generate random weather for unknown locations
        const conditions = ["Sunny", "Cloudy", "Rainy", "Clear", "Stormy", "Snowy", "Foggy"];
        weather = {
          temp: Math.floor(Math.random() * 35) - 5, // -5 to 30 degrees
          condition: conditions[Math.floor(Math.random() * conditions.length)],
          humidity: Math.floor(Math.random() * 100),
          wind: Math.floor(Math.random() * 30)
        };
      }
      
      if (unit === "fahrenheit") {
        weather.temp = (weather.temp * 9/5) + 32;
      }
      
      // Response according to Claude's expected format
      return {
        content: [
          {
            type: "text",
            text: `Current weather in ${location}: ${Math.round(weather.temp)}${unit === "celsius" ? "°C" : "°F"}, ${weather.condition}, Humidity: ${weather.humidity}%, Wind: ${weather.wind} km/h`
          }
        ]
      };
    } catch (error) {
      console.error("Error in WeatherInfo:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error getting weather for ${location}: ${error.message}`
          }
        ]
      };
    }
  }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main();