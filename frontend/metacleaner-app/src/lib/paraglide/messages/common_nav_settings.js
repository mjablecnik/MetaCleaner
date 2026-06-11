/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Nav_SettingsInputs */

const en_common_nav_settings = /** @type {(inputs: Common_Nav_SettingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Settings`)
};

const cs_common_nav_settings = /** @type {(inputs: Common_Nav_SettingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nastavení`)
};

/**
* | output |
* | --- |
* | "Settings" |
*
* @param {Common_Nav_SettingsInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_nav_settings = /** @type {((inputs?: Common_Nav_SettingsInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Nav_SettingsInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_nav_settings(inputs)
	return cs_common_nav_settings(inputs)
});
export { common_nav_settings as "common.nav.settings" }