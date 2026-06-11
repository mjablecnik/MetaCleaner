/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Footer_CopyrightInputs */

const en_common_footer_copyright = /** @type {(inputs: Common_Footer_CopyrightInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`© 2025 MetaCleaner. All rights reserved.`)
};

const cs_common_footer_copyright = /** @type {(inputs: Common_Footer_CopyrightInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`© 2025 MetaCleaner. Všechna práva vyhrazena.`)
};

/**
* | output |
* | --- |
* | "© 2025 MetaCleaner. All rights reserved." |
*
* @param {Common_Footer_CopyrightInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_footer_copyright = /** @type {((inputs?: Common_Footer_CopyrightInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Footer_CopyrightInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_footer_copyright(inputs)
	return cs_common_footer_copyright(inputs)
});
export { common_footer_copyright as "common.footer.copyright" }