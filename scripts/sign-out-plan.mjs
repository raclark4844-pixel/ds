/** @param {number} ms */
const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("Sign-out timed out")), ms));

/** @param {{livePreview:boolean,hasBearer:boolean,requestSignOut:()=>Promise<unknown>,clearToken:()=>void}} options */
export async function runPreSignInSignOut(options) {
  try {
    await Promise.race([options.requestSignOut(), timeout(options.livePreview ? 1500 : 8000)]);
  } catch (error) {
    if (!options.livePreview && !options.hasBearer) throw error;
  } finally {
    options.clearToken();
  }
}

/** @param {{livePreview:boolean,hasBearer:boolean,requestSignOut:()=>Promise<unknown>,clearToken:()=>void,redirect:()=>void}} options */
export async function runSignOut(options) {
  try {
    await Promise.race([options.requestSignOut(), timeout(options.livePreview ? 1500 : 8000)]);
  } catch (error) {
    if (!options.livePreview && !options.hasBearer) throw error;
  }
  options.clearToken();
  options.redirect();
}
