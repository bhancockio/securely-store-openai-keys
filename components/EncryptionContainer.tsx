import {
  decryptKey,
  encryptKey,
  generatePassphrase,
  generateSalt,
} from "@/lib/crypto-utils";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { generateAIDadJoke } from "@/lib/openai";

// Button styling
const baseButtonStyle =
  "rounded-md px-4 py-2 text-green-500 border border-green-500 hover:bg-green-500 hover:text-white focus:outline-none focus:ring";
const disabledButtonStyle = "hidden";

function EncryptionContainer() {
  // State
  const [saving, setSaving] = useState(false);
  const [generatingJoke, setGeneratingJoke] = useState(false);
  const [openAIKeyInput, setOpenAIKeyInput] = useState("");
  const [encryptedKey, setEncryptedKey] = useState("");
  const [decryptedKey, setDecryptedKey] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [salt, setSalt] = useState("");
  const [dadJoke, setDadJoke] = useState("");

  // Use Effects
  useEffect(() => {
    const fetchEncryptionKey = async () => {
      const response = await axios.get<{
        salt?: string | null;
        passphrase?: string | null;
        message?: string;
      }>("/api/user-encryption");

      if (response.status !== 200) {
        toast.error(response.data.message ?? "Error fetching encrypted key");
        setSalt("");
        setPassphrase("");
        return;
      }

      setSalt(response.data.salt ?? "");
      setPassphrase(response.data.passphrase ?? "");
    };

    const loadLocalStorageKey = () => {
      const encryptedKey = localStorage.getItem("openai-key");
      if (encryptedKey) {
        setEncryptedKey(encryptedKey);
      }
    };

    fetchEncryptionKey();
    loadLocalStorageKey();
  }, []);

  // Handle encryption
  const generateRandomCredentials = () => {
    const newPassphrase = generatePassphrase(16); // Implement this function in your crypto-utils
    const newSalt = generateSalt(); // Implement this function in your crypto-utils
    setPassphrase(newPassphrase);
    setSalt(newSalt);
  };

  // Function to generate a random passphrase and salt
  const handleEncrypt = () => {
    try {
      const combinedEncryptedData = encryptKey(
        openAIKeyInput,
        passphrase,
        salt
      );
      setEncryptedKey(combinedEncryptedData);
    } catch (error) {
      console.error("Encryption error:", error);
      toast.error("Error encrypting key");
    }
  };

  // Handle decryption (for demonstration)
  const handleDecrypt = () => {
    try {
      const decryptedData = decryptKey(encryptedKey, passphrase, salt);
      setDecryptedKey(decryptedData);
    } catch (error) {
      console.error("Decryption error:", error);
      toast.error("Error decrypting key");
    }
  };

  const handleSave = async () => {
    setSaving(true);

    console.log("Saving key:", encryptedKey);
    try {
      const response = await axios.post("/api/user-encryption", {
        salt,
        passphrase,
      });

      if (response.status === 200) {
        localStorage.setItem("openai-key", encryptedKey);
        toast.success("Saved successfully to database");
      } else {
        localStorage.removeItem("openai-key");
        toast.error("Error saving to database");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error saving key");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateJoke = async () => {
    setGeneratingJoke(true);
    const newJoke = await generateAIDadJoke(decryptedKey);
    setGeneratingJoke(false);

    if (!newJoke) {
      toast.error("Error generating dad joke");
      return;
    }

    setDadJoke(newJoke);
  };

  return (
    <div className="flex flex-col m-6 space-y-6 flex-grow">
      <h1 className="font-bold text-2xl">API Keys</h1>
      <div className="space-x-2">
        <button className={baseButtonStyle} onClick={generateRandomCredentials}>
          Generate Salt & Passphrase
        </button>
        <button
          className={`${
            openAIKeyInput && salt && passphrase
              ? baseButtonStyle
              : disabledButtonStyle
          }`}
          disabled={!passphrase || !salt}
          onClick={handleEncrypt}
        >
          Encrypt
        </button>
        <button
          className={`${encryptedKey ? baseButtonStyle : disabledButtonStyle}`}
          disabled={!encryptedKey || saving}
          onClick={() => handleSave()}
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          className={`${
            encryptedKey && salt && passphrase
              ? baseButtonStyle
              : disabledButtonStyle
          }`}
          onClick={handleDecrypt}
          disabled={!encryptedKey || saving}
        >
          Decrypt
        </button>
        <button
          className={`${decryptedKey ? baseButtonStyle : disabledButtonStyle}`}
          onClick={handleGenerateJoke}
          disabled={!decryptedKey || generatingJoke}
        >
          {generatingJoke ? "Generating..." : "Generate joke"}
        </button>
      </div>

      <div className="flex flex-row space-x-4 items-center">
        <label className="font-semibold" htmlFor="openai-key-input">
          OpenAI Key
        </label>
        <input
          id="openai-key-input"
          className="border bg-gray-200 rounded-md w-1/2 px-4 py-2 "
          placeholder="OpenAI Key Here..."
          type="password"
          onChange={(e) => setOpenAIKeyInput(e.target.value)}
        />
      </div>
      {/* Passphrase Display */}
      <div className="flex items-center space-x-4">
        <label className="font-semibold">Passphrase:</label>
        <p className="bg-gray-200 rounded-md px-4 py-2">
          {passphrase || "No passphrase generated"}
        </p>
      </div>

      {/* Salt Display */}
      <div className="flex items-center space-x-4">
        <label className="font-semibold">Salt:</label>
        <p className="bg-gray-200 rounded-md px-4 py-2">
          {salt || "No salt generated"}
        </p>
      </div>
      <div className="flex flex-row space-x-4 items-center">
        <label className="font-semibold">Encrypted Key:</label>
        <p className="bg-gray-200 rounded-md px-4 py-2">
          {encryptedKey || "No encrypted OpenAI Key"}
        </p>
      </div>
      <div className="flex flex-row space-x-4 items-center">
        <label className="font-semibold">Decrypted Key:</label>
        <p className="bg-gray-200 rounded-md px-4 py-2">
          {decryptedKey || "No decrypted OpenAI Key"}
        </p>
      </div>
      <div className="flex flex-row space-x-4 items-center">
        <label className="font-semibold">AI Generated Dad Joke:</label>
        <p className="bg-gray-200 rounded-md px-4 py-2">
          {dadJoke || "No dad joke generated."}
        </p>
      </div>
    </div>
  );
}

export default EncryptionContainer;
