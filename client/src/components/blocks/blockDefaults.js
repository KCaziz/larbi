// Content a new block starts with (what the server would fill in as defaults).
export const NEW_BLOCK_DATA = {
  text: { html: '' },
  code: { language: 'plaintext', code: '', caption: '' },
  table: { headers: ['', ''], rows: [['', '']], caption: '' },
  quote: { text: '', author: '' },
  callout: { variant: 'info', title: '', html: '' },
  // No link yet: a link without an address is refused by the server, so the author adds them one by one.
  resources: { title: '', items: [] },
};
