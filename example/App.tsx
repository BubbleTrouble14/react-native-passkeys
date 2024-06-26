import base64 from "@hexagon/base64";
import {
  Base64URLString,
  PublicKeyCredentialUserEntityJSON,
} from "@simplewebauthn/typescript-types";
import * as Application from "expo-application";
import React from "react";
import {
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as passkey from "react-native-passkeys";
import "fast-text-encoding";
import { atob, btoa } from "react-native-quick-base64";

// - Polyfill Buffer
if (typeof Buffer === "undefined") {
  global.Buffer = require("buffer").Buffer;
}

// - Polyfill atob and btoa
if (Platform.OS !== "web") {
  global.atob = atob;
  global.btoa = btoa;
}

// ! taken from https://github.com/MasterKale/SimpleWebAuthn/blob/e02dce6f2f83d8923f3a549f84e0b7b3d44fa3da/packages/browser/src/helpers/bufferToBase64URLString.ts
/**
 * Convert the given array buffer into a Base64URL-encoded string. Ideal for converting various
 * credential response ArrayBuffers to string for sending back to the server as JSON.
 *
 * Helper method to compliment `base64URLStringToBuffer`
 */
export function bufferToBase64URLString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";

  for (const charCode of bytes) {
    str += String.fromCharCode(charCode);
  }

  const base64String = btoa(str);

  return base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// ! taken from https://github.com/MasterKale/SimpleWebAuthn/blob/e02dce6f2f83d8923f3a549f84e0b7b3d44fa3da/packages/browser/src/helpers/utf8StringToBuffer.ts
/**
 * A helper method to convert an arbitrary string sent from the server to an ArrayBuffer the
 * authenticator will expect.
 */
export function utf8StringToBuffer(value: string): ArrayBuffer {
  return new TextEncoder().encode(value);
}

/**
 * Decode a base64url string into its original string
 */
export function base64UrlToString(base64urlString: Base64URLString): string {
  return base64.toString(base64urlString, true);
}

const rp = {
  id: process.env.EXPO_PUBLIC_HOSTNAME,
  // id: Platform.select({
  //   web: undefined,
  //   native: `${Application.applicationId?.split(".").reverse().join(".")}`,
  // }),
  name: "ReactNativePasskeys",
} satisfies PublicKeyCredentialRpEntity;

// Don't do this in production!
const challenge = bufferToBase64URLString(utf8StringToBuffer("fizz"));

const user = {
  id: bufferToBase64URLString(utf8StringToBuffer("290283490")),
  displayName: "bubble",
  name: "bubble",
} satisfies PublicKeyCredentialUserEntityJSON;

const authenticatorSelection = {
  // authenticatorAttachment: "cross-platform",
  userVerification: "required",
  residentKey: "required",
} satisfies AuthenticatorSelectionCriteria;

export default function App() {
  const [result, setResult] = React.useState();
  const [credentialId, setCredentialId] = React.useState("");

  const createPasskey = async () => {
    try {
      const json = await passkey.create({
        challenge,
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        rp,
        user,
        authenticatorSelection,
        extensions: {
          prf: {
            eval: {
              first: bufferToBase64URLString(
                utf8StringToBuffer("Foo encryption key")
              ),
              second: bufferToBase64URLString(
                utf8StringToBuffer("Bar encryption key")
              ),
            },
          },
        },
      });

      // console.log("creation json -", json);

      if (json?.rawId) setCredentialId(json.rawId);

      setResult(json);
    } catch (e) {
      console.error("create error", e);
    }
  };

  const readBlob = async () => {
    // console.log("read");
    // console.log(bufferToBase64URLString(utf8StringToBuffer("Heysdf")));
    // console.log(
    //   base64UrlToString("VjeG40Ao7SNmF5Y-8ad9aATKtlMMEsZk2Z9qKr40LwE")
    // );
    const json = await passkey.get({
      rpId: rp.id,
      challenge,
      extensions: {
        prf: {
          eval: {
            first: bufferToBase64URLString(
              utf8StringToBuffer("Foo encryption key")
            ),
            second: bufferToBase64URLString(
              utf8StringToBuffer("Bar encryption key")
            ),
          },
        },
      },
    });

    console.log("read blob json -", json);

    const blob = json?.clientExtensionResults?.prf;
    console.log("PRF", json?.clientExtensionResults);
    // if (blob) alert("This passkey has blob", base64UrlToString(blob));

    // setResult(json);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fccefe" }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Testing Passkeys</Text>
        {/* <Text>Application ID: {Application.applicationId}</Text> */}
        <Text>
          Passkeys are {passkey.isSupported() ? "Supported" : "Not Supported"}
        </Text>
        {credentialId && <Text>User Credential ID: {credentialId}</Text>}
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={createPasskey}>
            <Text>Create</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={readBlob}>
            <Text>Read Blob</Text>
          </Pressable>
        </View>
        {result && (
          <Text style={styles.resultText}>
            Result {JSON.stringify(result, null, 2)}
          </Text>
        )}
      </ScrollView>
      <Text
        style={{
          textAlign: "center",
          position: "absolute",
          left: 0,
          right: 0,
        }}
      >
        Source available on{" "}
        <Text
          onPress={() =>
            Linking.openURL(
              "https://github.com/peterferguson/react-native-passkeys"
            )
          }
          style={{ textDecorationLine: "underline" }}
        >
          GitHub
        </Text>
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: "5%",
  },
  resultText: {
    maxWidth: "80%",
  },
  buttonContainer: {
    padding: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    rowGap: 4,
    justifyContent: "space-evenly",
  },
  button: {
    backgroundColor: "#fff",
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
});
