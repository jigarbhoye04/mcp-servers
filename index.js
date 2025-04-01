import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const WEATHERAPI_API_KEY = process.env.WEATHERAPI_API_KEY;

if (!WEATHERAPI_API_KEY) {
    console.warn("Please set WEATHERAPI_API_KEY in your .env file");
}

const server = new McpServer({
    name: "advanced-smart-planner-mcp",
    version: "1.0.0",
});

// Tool to get real-time weather information using WeatherAPI
server.tool(
    "RealWeatherInfo",
    {
        location: z.string().describe("Location to get weather for"),
        unit: z.enum(["metric", "imperial"]).optional().default("metric").describe("Units: metric (Celsius), imperial (Fahrenheit)"),
    },
    async ({ location, unit }) => {
        if (!WEATHERAPI_API_KEY) {
            return { content: [{ type: "text", text: "WeatherAPI key not configured." }] };
        }
        const unitParam = unit === "metric" ? "metric" : "imperial"; // WeatherAPI uses metric/imperial
        try {
            const response = await fetch(
                `https://api.weatherapi.com/v1/current.json?key=${WEATHERAPI_API_KEY}&q=${encodeURIComponent(location)}`
            );
            const data = await response.json();

            if (data.error) {
                return { content: [{ type: "text", text: `Could not retrieve weather information for ${location}: ${data.error.message}` }] };
            }

            const currentWeather = data.current;
            const temperature = unitParam === "metric" ? currentWeather.temp_c : currentWeather.temp_f;
            const condition = currentWeather.condition.text;
            const humidity = currentWeather.humidity;
            const windSpeed = unitParam === "metric" ? currentWeather.wind_kph : currentWeather.wind_mph;
            const speedUnit = unitParam === "metric" ? "km/h" : "miles/hour";

            return {
                content: [
                    {
                        type: "text",
                        text: `Current weather in ${location}: ${temperature}°${unitParam === "metric" ? "C" : "F"}, ${condition}, Humidity: ${humidity}%, Wind: ${windSpeed} ${speedUnit}`,
                    },
                ],
            };
        } catch (error) {
            console.error("Error in RealWeatherInfo (WeatherAPI):", error);
            return { content: [{ type: "text", text: `Error getting weather information for ${location}: ${error.message}` }] };
        }
    }
);

// Smart Event Planner Tool (focuses on weather)
server.tool(
    "SmartEventPlanner",
    {
        eventName: z.string().describe("Name of the event (e.g., 'Meeting with John')"),
        eventTime: z.string().describe("Time of the event (e.g., '2:00 PM')"),
        eventLocation: z.string().describe("Location of the event (e.g., 'Mountain View, CA')"),
        weatherUnit: z.enum(["metric", "imperial"]).optional().default("metric").describe("Units for weather"),
    },
    async ({ eventName, eventTime, eventLocation, weatherUnit }) => {
        try {
            const weatherResult = await server.invokeTool("RealWeatherInfo", { location: eventLocation, unit: weatherUnit });
            const weatherText = weatherResult.content.find(item => item.type === "text")?.text || "Could not retrieve weather information.";

            return {
                content: [
                    {
                        type: "text",
                        text: `Smart Plan for "${eventName}" at ${eventTime} in ${eventLocation}:\n\nWeather forecast at the location: ${weatherText}`,
                    },
                ],
            };
        } catch (error) {
            console.error("Error in SmartEventPlanner:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `Error creating smart plan for "${eventName}": ${error.message}`,
                    },
                ],
            };
        }
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main();