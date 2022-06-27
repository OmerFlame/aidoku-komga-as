import {
	Chapter,
	DeepLink,
	Filter,
	Listing,
	Manga,
	MangaPageResult,
	Page,
	Request,
	Source,
	defaults,
	console,
	FilterType,
	JSON,
	MangaStatus,
	MangaContentRating,
	MangaViewer
} from "../node_modules/aidoku-as/src/index";
//import { create_manga } from "../node_modules/aidoku-as/src/index";
import { HttpMethod, json } from "../node_modules/aidoku-as/src/modules/net";
import { array_len, ObjectType, typeof_std } from "../node_modules/aidoku-as/src/modules/std";

import { encode, decode } from "as-base64";

function stringToUInt8Array(str: string): Uint8Array {
	let stringLength = str.length;
	var array = new Uint8Array(stringLength);

	for (let i = 0; i < stringLength; i++) {
		array[i] = str.charCodeAt(i);
	}

	return array;
}

export class Komga extends Source {
	private baseUrl: string = defaults.get("serverURL").toString();
	private username: string = defaults.get("username").toString();
	private password: string = defaults.get("password").toString();
	private headers: Map<string, string>;

	constructor() {
		super();
		this.headers = new Map<string, string>();
		
		let unencoded: string = (this.username + ":" + this.password);
		//encode(new Uint8Array())
		this.headers.set("Authorization", "Basic " + encode(stringToUInt8Array(unencoded)));


	}

	modifyImageRequest(request: Request): void {
		// TODO
		//request.headers = this.headers;
		console.log(`IMAGE REQUEST ADDRESS: ${request.url}`);
	}

	getMangaList(filters: Filter[], page: i32): MangaPageResult {
		if (this.baseUrl.endsWith("/")) {
			this.baseUrl = this.baseUrl.slice(0, -1);
		}

		var endpoint: string = `/api/v1/series?unpaged=false&page=${page - 1}`

		for (let i = 0; i < filters.length; i++) {
			const filter = filters[i];
			
			if (filter.type == FilterType.Title) {
				endpoint += `&search=${encodeURI(filter.value.toString())}`;
			}
		}

		const fullAddress: string = this.baseUrl + endpoint;

		console.log(`FULL ADDRESS: ${fullAddress}`);

		const request = Request.create(HttpMethod.GET);
		request.url = fullAddress;
		request.headers = this.headers;

		var response: JSON = request.json();

		if (response.asObject().get("content").type != ObjectType.Array) {
			return new MangaPageResult([], false);
		}

		let contentArray = response.asObject().get("content");

		var mangaArray: Manga[] = [];

		for (let i = 0; i < i32(array_len(contentArray.rid)); i++) {
			let manga = contentArray.asArray().get(i).asObject();
			let mangaMeta = manga.get("metadata").asObject();

			let id = manga.get("id").toString();
			let title = manga.get("name").toString();
			let coverURL = `${this.baseUrl}/api/v1/series/${id}/thumbnail`;
			let author: string;
			let description = mangaMeta.get("summary").toString();
			let categories: string[] = [];

			if (array_len(mangaMeta.get("tags").rid) != 0) {
				let tagsArray = mangaMeta.get("tags").asArray();

				for (let i = 0; i < i32(array_len(mangaMeta.get("tags").rid)); i++) {
					categories.push(tagsArray.get(i).toString());
				}
			}

			if (array_len(mangaMeta.get("authors").rid) != 0) {
				author = mangaMeta.get("authors").asArray().get(0).toString();
			} else {
				author = "";
			}

			let mangaInstance = new Manga(id, title);

			mangaInstance.cover_url = coverURL;
			mangaInstance.author = author;
			mangaInstance.artist = author;
			mangaInstance.description = description;
			mangaInstance.url = `${this.baseUrl}/api/v1/series/${id}`;
			mangaInstance.categories = categories;
			mangaInstance.status = MangaStatus.Unknown;
			mangaInstance.rating = MangaContentRating.Safe;
			mangaInstance.viewer = MangaViewer.RTL;

			mangaArray.push(mangaInstance);
		}

		return new MangaPageResult(mangaArray, true);
	}

	getMangaDetails(mangaId: string): Manga {
		if (this.baseUrl.endsWith("/")) {
			this.baseUrl = this.baseUrl.slice(0, -1);
		}

		var endpoint = `/api/v1/series/${mangaId}`;

		const fullAddress: string = this.baseUrl + endpoint;

		const request = Request.create(HttpMethod.GET);
		request.url = fullAddress;
		//request.headers = this.headers;

		var response: JSON = request.json();

		let mangaObject = response.asObject();
		let mangaMeta = mangaObject.get("metadata").asObject();

		let title = mangaObject.get("name").toString();
		let coverURL = `${this.baseUrl}/api/v1/series/${mangaId}/thumbnail`;
		let author: string = "";
		let description = mangaMeta.get("summary").toString();
		let categories: string[] = [];

		if (array_len(mangaMeta.get("tags").rid) != 0) {
			let tagsArray = mangaMeta.get("tags").asArray();

			for (let i = 0; i < i32(array_len(mangaMeta.get("tags").rid)); i++) {
				categories.push(tagsArray.get(i).toString());
			}
		}

		if (array_len(mangaMeta.get("authors").rid) != 0) {
			author = mangaMeta.get("authors").asArray().get(0).toString();
		} else {
			author = "";
		}

		let mangaInstance = new Manga(mangaId, title);

		mangaInstance.cover_url = coverURL;
		mangaInstance.author = author;
		mangaInstance.artist = author;
		mangaInstance.description = description;
		mangaInstance.url = "";
		mangaInstance.categories = categories;
		mangaInstance.status = MangaStatus.Unknown;
		mangaInstance.rating = MangaContentRating.Safe;
		mangaInstance.viewer = MangaViewer.RTL;

		return mangaInstance;
	}

	getChapterList(mangaId: string): Chapter[] {
		if (this.baseUrl.endsWith("/")) {
			this.baseUrl = this.baseUrl.slice(0, -1);
		}

		var endpoint: string = `/api/v1/series/${mangaId}/books?unpaged=true`;

		const fullAddress: string = this.baseUrl + endpoint;

		console.log(`FULL ADDRESS: ${fullAddress}`);

		const request = Request.create(HttpMethod.GET);
		request.url = fullAddress;
		request.headers = this.headers;

		var response: JSON = request.json();

		if (response.asObject().get("content").type != ObjectType.Array) {
			return [];
		}

		let contentArray = response.asObject().get("content");

		var chapterArray: Chapter[] = [];

		for (let i = 0; i < i32(array_len(contentArray.rid)); i++) {
			let chapter = contentArray.asArray().get(i).asObject();
			let chapterMeta = chapter.get("metadata").asObject();

			let id = chapter.get("id").toString();
			let title = chapterMeta.get("title").toString();
			let chapterNumber = chapterMeta.get("number").toString();
			let url = `${this.baseUrl} + /api/v1/books/${id}`

			let chapterInstance = new Chapter(id, title);

			chapterInstance.chapter = f32(parseInt(chapterNumber, 10));
			chapterInstance.url = url;

			chapterArray.push(chapterInstance);
		}

		return chapterArray;
	}

	getPageList(chapterId: string): Page[] {
		if (this.baseUrl.endsWith("/")) {
			this.baseUrl = this.baseUrl.slice(0, -1);
		}
		
		var endpoint: string = `/api/v1/books/${chapterId}/pages`;

		const fullAddress: string = this.baseUrl + endpoint;

		console.log(`FULL ADDRESS: ${fullAddress}`);

		const request = Request.create(HttpMethod.GET);
		request.url = fullAddress;
		request.headers = this.headers;

		var response: JSON = request.json();

		var pageArray: Page[] = [];

		for (let i = 0; i < i32(array_len(response.rid)); i++) {
			let page = response.asArray().get(i).asObject();

			let url = `${this.baseUrl}${endpoint}/${page.get("number").toInteger()}?convert=png`;

			let pageInstance = new Page(i);

			pageInstance.url = url;

			pageArray.push(pageInstance);
		}

		return pageArray;
	}

	/*private getMangaDetailsFromChapterPage(chapterId: string): Manga {
		// TODO
	}*/
}
