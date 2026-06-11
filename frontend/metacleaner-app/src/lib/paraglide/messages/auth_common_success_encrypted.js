/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Success_EncryptedInputs */

const en_auth_common_success_encrypted = /** @type {(inputs: Auth_Common_Success_EncryptedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your password is securely encrypted and stored.`)
};

const cs_auth_common_success_encrypted = /** @type {(inputs: Auth_Common_Success_EncryptedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vaše heslo je bezpečně zašifrováno a uloženo.`)
};

/**
* | output |
* | --- |
* | "Your password is securely encrypted and stored." |
*
* @param {Auth_Common_Success_EncryptedInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_success_encrypted = /** @type {((inputs?: Auth_Common_Success_EncryptedInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Success_EncryptedInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_success_encrypted(inputs)
	return cs_auth_common_success_encrypted(inputs)
});
export { auth_common_success_encrypted as "auth.common.success.encrypted" }