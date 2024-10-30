import { PseudoElementsList } from '../constants/pseudo-elements-list.constant';
import { PseudoElementType } from '../types/css-type';

export class CssStringSerializer {
    static Limiter = '||';

    static encode (content: string, pseudoElementType: PseudoElementType | null): string {
        if (!pseudoElementType) {
            return content;
        }

        return pseudoElementType + CssStringSerializer.Limiter + content;

    }

    static decode (serializedStr: string): string | [PseudoElementType, string] {
        const portions = serializedStr.split(CssStringSerializer.Limiter);
        if (portions.length === 1) {
            return portions[0];
        } else {
            const prefix = portions[0];
            if (!this.isValidPseudoElementType(prefix)) {
                return serializedStr;
            }
            return [prefix, portions[1]];
        }
    }

    private static isValidPseudoElementType (str: string): str is PseudoElementType {
        if (PseudoElementsList.includes(str as PseudoElementType)) {
            return true;
        }
        return false;
    }
}
