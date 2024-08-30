"use client";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const [isLedOn, setIsLedOn] = useState(false);
  const [isLedGreenOn, setIsLedGreenOn] = useState(false);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [ultrasonic, setUltrasonic] = useState<number>(0);
  const [ldr, setLdr] = useState<number | null>(null); // Add state for LDR
  const [latestId, setLatestId] = useState<number | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetch("/api/getAll");
        const data = await result.json();
        console.log("Fetched data:", data);

        if (data.length > 0) {
          const latestData = data[data.length - 1];
          setTemperature(latestData.temperature);
          setHumidity(latestData.humidity);
          setUltrasonic(latestData.ultrasonic);
          setLdr(latestData.LDR); // Ensure LDR has a value

          setIsLedOn(latestData.yellow === "on");
          setIsLedGreenOn(latestData.blue === "on");

          setStatus(latestData.status);

          if (latestData.id !== latestId) {
            setLatestId(latestData.id);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [latestId]);

  const sendLedState = async (ledColor: string, state: string) => {
    try {
      const response = await fetch("/api/control", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ led: ledColor, state: state }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to toggle ${ledColor} LED: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error sending LED state:", error);
    }
  };

  const toggleLed = async () => {
    const newState = isLedOn ? "off" : "on";
    setIsLedOn(!isLedOn);
    await sendLedState("yellow", newState);
  };

  const toggleUltrasonic = async () => {
    const newState = isLedGreenOn ? "off" : "on";
    setIsLedGreenOn(!isLedGreenOn);
    await sendLedState("blue", newState);
  };

  if (status != 0) {
    return (
      <div className="min-h-screen bg-gray-100 bg-gradient-to-br from-green-500 to-orange-600">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">
                LED <span className="text-yellow-500">Yellow</span>
              </h2>
              <button
                onClick={toggleLed}
                className={`mt-4 px-4 py-2 rounded-md text-white ${
                  isLedOn ? "bg-red-600" : "bg-green-600"
                }`}
              >
                {isLedOn ? "Turn Off LED" : "Turn On LED"}
              </button>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">
                LED <span className="text-blue-500">BLUE</span>
              </h2>
              <button
                onClick={toggleUltrasonic}
                className={`mt-4 px-4 py-2 rounded-md text-white ${
                  isLedGreenOn ? "bg-red-600" : "bg-green-600"
                }`}
              >
                {isLedGreenOn ? "Turn Off LED" : "Turn On LED"}
              </button>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">Temperature</h2>
              <p className="mt-4 text-2xl font-bold text-gray-900">
                {temperature !== null ? `${temperature}°C` : "Loading..."}
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">Humidity</h2>
              <p className="mt-4 text-2xl font-bold text-gray-900">
                {humidity !== null ? `${humidity}%` : "Loading..."}
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">Ultrasonic</h2>
              <p className="mt-4 text-2xl font-bold text-gray-900">
                {ultrasonic !== null ? `${ultrasonic}cm` : "Loading..."}
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">LDR</h2>
              <p className="mt-4 text-2xl font-bold text-gray-900">
                {ldr !== null ? `${ldr}` : "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }else{
    <div>Please press the switch!</div>
  }
};

export default Dashboard;
