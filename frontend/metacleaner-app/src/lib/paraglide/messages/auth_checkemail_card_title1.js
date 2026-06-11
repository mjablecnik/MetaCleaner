/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Card_Title1Inputs */

const en_auth_checkemail_card_title1 = /** @type {(inputs: Auth_Checkemail_Card_Title1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Check your email`)
};

const cs_auth_checkemail_card_title1 = /** @type {(inputs: Auth_Checkemail_Card_Title1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zkontrolujte e-mail`)
};

/**
* | output |
* | --- |
* | "Check your email" |
*
* @param {Auth_Checkemail_Card_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_card_title1 = /** @type {((inputs?: Auth_Checkemail_Card_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Card_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_card_title1(inputs)
	return cs_auth_checkemail_card_title1(inputs)
});
export { auth_checkemail_card_title1 as "auth.checkEmail.card.title" }