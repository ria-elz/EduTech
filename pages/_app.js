     import { SessionProvider } from "next-auth/react";
     import Layout from "../components/Layout";
     import "../styles/globals.css";

     console.log('=== DEBUGGING LAYOUT IMPORT ===');
     function MyApp({ Component, pageProps: { session, ...pageProps } }) {
       console.log('Rendering Layout:', Layout, typeof Layout);  // Add this
       return (
         <SessionProvider session={session}>
           <Layout>
             <Component {...pageProps} />
           </Layout>
         </SessionProvider>
       );
     }

     export default MyApp;
     