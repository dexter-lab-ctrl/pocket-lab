// Local MkDocs build-time Mermaid wrapper.
// The wrapper prevents strict offline builds from depending on a build-time CDN probe.
// At browser runtime it loads the same Mermaid module version that mkdocs-mermaid2 uses by default.
import mermaid from "https://unpkg.com/mermaid@10.4.0/dist/mermaid.esm.min.mjs";
export default mermaid;
