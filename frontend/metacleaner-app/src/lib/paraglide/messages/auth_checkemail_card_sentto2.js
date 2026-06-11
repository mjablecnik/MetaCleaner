/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Card_Sentto2Inputs */

const en_auth_checkemail_card_sentto2 = /** @type {(inputs: Auth_Checkemail_Card_Sentto2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`We sent a verification link to`)
};

const cs_auth_checkemail_card_sentto2 = /** @type {(inputs: Auth_Checkemail_Card_Sentto2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Poslali jsme ověřovací odkaz na`)
};

/**
* | output |
* | --- |
* | "We sent a verification link to" |
*
* @param {Auth_Checkemail_Card_Sentto2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_card_sentto2 = /** @type {((inputs?: Auth_Checkemail_Card_Sentto2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Card_Sentto2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_card_sentto2(inputs)
	return cs_auth_checkemail_card_sentto2(inputs)
});
export { auth_checkemail_card_sentto2 as "auth.checkEmail.card.sentTo" }