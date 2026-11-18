import niage from './niage';
import zouen from './zouen';
import tobi from './tobi';
import bousui from './bousui';
import kaitai from './kaitai';
import naisou from './naisou';
import tosou from './tosou';
import ashiba from './ashiba';

/** 単独ページを持つ業種（表示順）。 */
export const INDUSTRIES = [niage, zouen, tobi, bousui, kaitai, naisou, tosou, ashiba];
export const bySlug = slug => INDUSTRIES.find(i => i.slug === slug);
