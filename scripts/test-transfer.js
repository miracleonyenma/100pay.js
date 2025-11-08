import { Pay100 } from "../dist/index.js";

// Initialize the SDK with the provided API key
const pay100 = new Pay100({
  publicKey: "LIVE;PK;",
  privateKey: "", // Not needed for this test
});

// Test parameters - include oauthAccessToken in the data object
const accessToken = "ey...mY";

const transferData = {
  amount: 10,
  symbol: "NGN",
  to: "916698",
  from: "625988",
  transferType: "internal",
  note: "Testing 12",
  oauthAccessToken: accessToken, // Include the OAuth token in the data object
};

async function testTransfer() {
  try {
    console.log("Testing Pay100.transfer.executeTransfer...");
    console.log(
      "Transfer Data:",
      JSON.stringify(
        {
          ...transferData,
          oauthAccessToken:
            transferData.oauthAccessToken.substring(0, 50) + "...",
        },
        null,
        2
      )
    );
    console.log("");

    const response = await pay100.transfer.executeTransfer(transferData);

    console.log("✓ Transfer executed successfully!");
    console.log("Response:", JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("✗ Transfer failed:");
    console.error("Error:", error.message);
    if (error.response) {
      console.error(
        "Response Data:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
    process.exit(1);
  }
}

testTransfer();
