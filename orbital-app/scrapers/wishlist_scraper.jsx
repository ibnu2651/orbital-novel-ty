import { useState } from "react";
import { View } from "react-native";
import { getTitleDetails } from "../nlb_api/nlb";
import { WebView } from "react-native-webview";
import { useAuth } from "../contexts/auth"
import { addBook } from "../async_storage/storage";

async function handleParsedBooks(data) {
  const BRNs = data.filter(Number);
  console.log(BRNs);
  const book = null;
  for (let i = 0; i < BRNs.length; i++) {
    await getTitleDetails(BRNs[i], '').then(res => { addBook(res[0]).then(console.log(res)) });
  }
}

export function WishListScraperWebView() {
  const { user, password } = useAuth();
  const [injectParse, setInjectParse] = useState(false);

  const injectLoginScript = `
      document.getElementById('username').value="ibnu2651";
      document.getElementById('password').value="poohpanda26";
      document.getElementsByName('submit')[0].click();
      true;
    `;

  const injectParseScript = `
      const result = Array.prototype.slice.call(document.getElementsByClassName('item-title-value')).map(e => e.href.split('BRN=').pop());
      window.ReactNativeWebView.postMessage(JSON.stringify(result));
      true;
    `;

  const handleWebViewLoad = () => {
    if (!injectParse) {
      this.webref.injectJavaScript(injectLoginScript);
      setInjectParse(true);
    } else {
      setTimeout(() => {
        this.webref.injectJavaScript(injectParseScript);
      }, 2000);
    }
    console.log("load end");
  };

  return (
    // delete style to hide
    <View style={{ flex: 1 }}>
      <WebView
        ref={(r) => (this.webref = r)}
        style={{ flex: 1 }} //change to 0 to hide
        source={{ uri: "https://www.nlb.gov.sg/mylibrary/Bookmarks" }}
        onLoadEnd={handleWebViewLoad}
        onMessage={(msg) => {
          handleParsedBooks(JSON.parse(msg.nativeEvent.data));
        }}
      />
    </View>
  );
}
