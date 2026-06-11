/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Field_RememberInputs */

const en_auth_login_field_remember = /** @type {(inputs: Auth_Login_Field_RememberInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remember me on this device`)
};

const cs_auth_login_field_remember = /** @type {(inputs: Auth_Login_Field_RememberInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zapamatovat si mě na tomto zařízení`)
};

/**
* | output |
* | --- |
* | "Remember me on this device" |
*
* @param {Auth_Login_Field_RememberInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_field_remember = /** @type {((inputs?: Auth_Login_Field_RememberInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Field_RememberInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_field_remember(inputs)
	return cs_auth_login_field_remember(inputs)
});
export { auth_login_field_remember as "auth.login.field.remember" }