import { useLocale } from '../contexts/index.js'
import { SOURCE_REPO_URL } from '../Utils.js'
import { Octicon } from './index.js'

interface Props {
	donate?: boolean,
}
export function Footer({ donate }: Props) {
	const { locale } = useLocale()

	return <footer>
		<p>
			<span>Forked By <a href="https://github.com/hpf3" target=" blank" rel="noreferrer">Hpf3</a></span>
		</p>
		<p>
			<span>{locale('developed_by')} <a href="https://github.com/misode" target="_blank" rel="noreferrer">Misode</a></span>
		</p>
		<p>
			{Octicon.mark_github}
			<span>{locale('source_code_on')} <a href={SOURCE_REPO_URL} target="_blank" rel="noreferrer">{locale('github')}</a></span>
		</p>
		<p>
			<span>See the original: <a href="https://misode.github.io/" target="_blank" rel="noreferrer">https://misode.github.io/</a></span>
		</p>
		{donate !== false && <p class="donate">
			{Octicon.heart}
			<a href="https://ko-fi.com/misode" target="_blank" rel="noreferrer">{locale('donate')}</a>
		</p>}

	</footer>
}
