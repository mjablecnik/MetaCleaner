/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Waiting_Autorefresh2Inputs */

const en_auth_checkemail_waiting_autorefresh2 = /** @type {(inputs: Auth_Checkemail_Waiting_Autorefresh2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This page refreshes automatically`)
};

const cs_auth_checkemail_waiting_autorefresh2 = /** @type {(inputs: Auth_Checkemail_Waiting_Autorefresh2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tato stránka se automaticky aktualizuje`)
};

/**
* | output |
* | --- |
* | "This page refreshes automatically" |
*
* @param {Auth_Checkemail_Waiting_Autorefresh2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_waiting_autorefresh2 = /** @type {((inputs?: Auth_Checkemail_Waiting_Autorefresh2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Waiting_Autorefresh2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_waiting_autorefresh2(inputs)
	return cs_auth_checkemail_waiting_autorefresh2(inputs)
});
export { auth_checkemail_waiting_autorefresh2 as "auth.checkEmail.waiting.autoRefresh" }