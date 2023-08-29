import { defineConfig } from "vite";
import type { PluginOption } from 'vite'
import { VitePWA } from "vite-plugin-pwa";

// Set to false to disable eruda during development
const eruda = true;

const erudaInjector: PluginOption = {
  name: 'erudaInjector',
  transformIndexHtml: html => {
    return {
      html,
      tags: [
        {
          tag: 'script',
          attrs: {
            src: '/node_modules/eruda/eruda'
          },
          injectTo: 'body'
        }, {
          tag: 'script',
          injectTo: 'body',
          children: 'eruda.init()'
        }
      ]
    }
  }
}

const manifest = {
  "short_name": "ytify",
  "name": "audio streaming with ytify",
  "description": "32kb/s to 128kb/s youtube audio streaming website. Copy a youtube video link and listen to it as an audio totally free.",
  "icons": [
    {
      "src": "logo_192px.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "any maskable"
    },
    {
      "src": "logo_512px.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "any maskable"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "white",
  "background_color": "#00bfff",
  "share_target": {
    "action": "/",
    "method": "GET",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}

export default defineConfig(({ command }) => {
  return {
    plugins: (eruda && command === 'serve') ? [
      erudaInjector,
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          // enabled: true
        },

        manifest: manifest
      })
    ] : [
      VitePWA({
        registerType: 'autoUpdate',
        manifest: manifest
      })]
  }
});
