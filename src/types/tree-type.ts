/*
    page-processing-lib - A library for processing web pages and extracting data from them.
    Copyright (C) 2024-2025 Acquia Inc.

    This file is part of page-processing-lib.

    page-processing-lib is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 2 of the License, or
    (at your option) any later version.

    page-processing-lib is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with page-processing-lib. If not, see <http://www.gnu.org/licenses/>.
*/
export type TreeType = ElementType;

export type ElementType = {
    tn?: string,
    ci?: number,
    a?: Array<Array<string>>,
    c?: Array<TreeType | TextNodeType>,
    sr?: ShadowRootType,
} | Record<string, never>

export type ShadowRootType = {
    tn?: string,
    ci?: number,
    a?: Array<Array<string>>,
    c?: Array<TreeType | TextNodeType>,
    sr?: ShadowRootType,
}

export type TextNodeType = { t: string };
