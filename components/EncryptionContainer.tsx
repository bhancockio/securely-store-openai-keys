import { decryptKey, encryptKey } from "@/lib/crypto-utils";
import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

function EncryptionContainer() {
  // State
  const [saving, setSaving] = useState(false);
  const [encrypting, setEncrypting] = useState(false);
  const [passphraseInput, setPassphraseInput] = useState("");
  const [openAIKeyInput, setOpenAIKeyInput] = useState("");
  const [encryptedKey, setEncryptedKey] = useState("");
  const [decryptedKey, setDecryptedKey] = useState("");

  // Handle encryption
  const handleEncrypt = () => {
    setEncrypting(true);
    try {
      const combinedEncryptedData = encryptKey(openAIKeyInput, passphraseInput);
      setEncryptedKey(combinedEncryptedData);
    } catch (error) {
      console.error("Encryption error:", error);
      toast.error("Error encrypting key");
    }
    setEncrypting(false);
  };

  // Handle decryption (for demonstration)
  const handleDecrypt = () => {
    try {
      const decryptedData = decryptKey(encryptedKey, passphraseInput);
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
        data: 123,
        encryptedKey,
      });

      if (response.status === 200) {
        toast.success("Key saved successfully");
      } else {
        toast.error("Error saving key");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error saving key");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col m-6 space-y-6 max-w-1/2">
      <h1 className="font-bold text-2xl">API Keys</h1>
      <div className="flex flex-row space-x-4">
        <input
          className="bg-black border border-white rounded-md w-1/2 px-4 py-2 text-white"
          placeholder="Passphrase Here..."
          onChange={(e) => setPassphraseInput(e.target.value)}
        />
      </div>
      <div className="flex flex-row space-x-4">
        <input
          className="bg-black border border-white rounded-md w-1/2 px-4 py-2 text-white"
          placeholder="OpenAI Key Here..."
          type="password"
          onChange={(e) => setOpenAIKeyInput(e.target.value)}
        />
        <button
          className="bg-black border border-green-500 rounded-md px-4 py-2 text-green-500 hover:bg-green-500 hover:text-white disabled:text-green-900 disabled:hover:bg-black"
          disabled={!passphraseInput}
          onClick={handleEncrypt}
        >
          {encrypting ? "Encrypting..." : "Encrypt"}
        </button>
        <button
          className="bg-green-500 rounded-md px-4 py-2 text-white hover:bg-green-700 disabled:text-green-900 disabled:hover:bg-green-500 disabled:cursor-not-allowed"
          disabled={!encryptedKey || saving}
          onClick={() => handleSave()}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      <div className="flex flex-row space-x-4 text-lg">
        <p>Encrypted Key:</p>
        <p className="break-words max-w-md">
          {encryptedKey ? encryptedKey : "No encrypted OpenAI Key"}
        </p>
      </div>
      <div className="flex flex-row space-x-4 text-lg">
        <p>Decrypted Key:</p>
        <p className="break-words max-w-md">
          {decryptedKey ? (
            // TODO: Add that eye icon to show/hide the key
            <span>decryptedKey</span>
          ) : (
            "No decrypted OpenAI Key"
          )}
        </p>
      </div>
    </div>
  );
}

export default EncryptionContainer;
