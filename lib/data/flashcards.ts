export interface Flashcard {
  id: string
  front: string
  back: string
  category: string
}

export const FLASHCARD_CATEGORY = {
  DESCRIBING_WORK: 'Describing your work',
  ASKING_CLARIFYING: 'Asking & clarifying',
  UNKNOWN_WORDS: "When you don't know a word",
  CODE_REVIEWS: 'Code reviews & PRs',
  ARCHITECTURE: 'Architecture & technical decisions',
  DEBUGGING: 'Debugging & problems',
  JOB_INTRO: 'Job interviews - about yourself',
  SYSTEM_DESIGN: 'System design',
  BEHAVIORAL: 'Behavioral interviews',
  INTERVIEW_RECOVERY: "When you don't know in interview",
  MEETINGS: 'Meetings & standups',
  BACKEND_APIS: 'Backend & APIs',
  FRONTEND_UI: 'Frontend & UI',
  TESTING_QA: 'Testing & QA',
  RELEASES: 'Releases & deployment',
  TEAMWORK: 'Teamwork & collaboration',
  SECURITY: 'Security & reliability',
  PHRASAL_VERBS: 'Phrasal verbs & dev idioms',
} as const

type FlashcardEntry = readonly [front: string, back: string]

function buildCards(prefix: string, category: string, entries: readonly FlashcardEntry[]): Flashcard[] {
  return entries.map(([front, back], index) => ({
    id: `${prefix}_${index + 1}`,
    front,
    back,
    category,
  }))
}

const describingWorkEntries = [
  ["I'm currently working on...", 'Actualmente estoy trabajando en...'],
  ['I was implementing a feature that...', 'Estaba implementando una funcionalidad que...'],
  ['The issue was related to...', 'El problema estaba relacionado con...'],
  ['I fixed a bug where...', 'Arreglé un bug donde...'],
  ["I'm responsible for the frontend/backend of...", 'Soy responsable del frontend/backend de...'],
  ['We use [React/Node/etc.] for...', 'Usamos [React/Node/etc.] para...'],
  ['The main goal of this task is to...', 'El objetivo principal de esta tarea es...'],
  ['I am working on the integration between... and...', 'Estoy trabajando en la integración entre... y...'],
  ['The feature is almost ready, but we still need to...', 'La funcionalidad casi está lista, pero aún necesitamos...'],
  ['This part of the system handles...', 'Esta parte del sistema maneja...'],
] as const satisfies readonly FlashcardEntry[]

const askingClarifyingEntries = [
  ['Could you clarify what you mean by...?', '¿Podrías aclarar qué quieres decir con...?'],
  ['Just to make sure I understood correctly...', 'Solo para asegurarme de que entendí correctamente...'],
  ["So basically what you're saying is...?", 'Entonces básicamente lo que dices es...?'],
  ['Can you give me an example?', '¿Puedes darme un ejemplo?'],
  ['What should happen if...?', '¿Qué debería pasar si...?'],
  ['Are we optimizing for... or for...?', '¿Estamos optimizando para... o para...?'],
  ['What is the expected behavior here?', '¿Cuál es el comportamiento esperado aquí?'],
  ['Do we already have a pattern for this?', '¿Ya tenemos un patrón para esto?'],
  ['Should this be in scope for this ticket?', '¿Esto debería estar dentro del alcance de este ticket?'],
  ['How will we know this is done?', '¿Cómo sabremos que esto está terminado?'],
] as const satisfies readonly FlashcardEntry[]

const unknownWordsEntries = [
  ["I don't know the exact term in English, but basically it's...", 'No sé el término exacto en inglés, pero básicamente es...'],
  ['What I mean is...', 'Lo que quiero decir es...'],
  ["It's kind of like... but for...", 'Es algo así como... pero para...'],
  ['The closest word I can think of is...', 'La palabra más cercana que se me ocurre es...'],
  ['It is the part that handles...', 'Es la parte que maneja...'],
  ['I am missing the exact word, but the idea is...', 'Me falta la palabra exacta, pero la idea es...'],
] as const satisfies readonly FlashcardEntry[]

const codeReviewEntries = [
  ['This could be refactored to...', 'Esto podría refactorizarse para...'],
  ['I left a comment on line 42 because...', 'Dejé un comentario en la línea 42 porque...'],
  ['The logic here seems off, maybe we should...', 'La lógica aquí parece incorrecta, quizás deberíamos...'],
  ['LGTM — looks good to me', 'Se ve bien para mí'],
  ["There's a potential edge case when...", 'Hay un posible caso límite cuando...'],
  ['We should handle the case where the API returns null', 'Deberíamos manejar el caso donde la API retorna null'],
  ['I think this would be easier to read if...', 'Creo que esto sería más fácil de leer si...'],
  ['Can we simplify this condition?', '¿Podemos simplificar esta condición?'],
  ['This name is a bit ambiguous', 'Este nombre es un poco ambiguo'],
  ['Would it make sense to extract this into a helper?', '¿Tendría sentido extraer esto a un helper?'],
] as const satisfies readonly FlashcardEntry[]

const architectureEntries = [
  ['We decided to go with [X] instead of [Y] because...', 'Decidimos usar [X] en lugar de [Y] porque...'],
  ['The tradeoff here is...', 'El tradeoff aquí es...'],
  ["This approach doesn't scale well because...", 'Este enfoque no escala bien porque...'],
  ["We're using a REST API / we switched to GraphQL because...", 'Estamos usando una REST API / migramos a GraphQL porque...'],
  ['The bottleneck is in the database layer', 'El cuello de botella está en la capa de base de datos'],
  ["We're handling this asynchronously to avoid blocking the main thread", 'Estamos manejando esto de forma asíncrona para evitar bloquear el hilo principal'],
  ['This service is responsible for...', 'Este servicio es responsable de...'],
  ['We need to optimize for maintainability here', 'Necesitamos optimizar por mantenibilidad aquí'],
  ['This design reduces coupling between...', 'Este diseño reduce el acoplamiento entre...'],
  ['The main constraint is...', 'La principal restricción es...'],
] as const satisfies readonly FlashcardEntry[]

const debuggingEntries = [
  ['The issue only happens in production', 'El problema solo ocurre en producción'],
  ['I reproduced the bug locally', 'Reproduje el bug localmente'],
  ["It's a race condition between...", 'Es una condición de carrera entre...'],
  ['The root cause was...', 'La causa raíz fue...'],
  ['I added some logs to trace the issue', 'Agregué algunos logs para rastrear el problema'],
  ['The stack trace points to...', 'El stack trace apunta a...'],
  ['I can reproduce it consistently', 'Puedo reproducirlo de forma consistente'],
  ['The error happens after the second request', 'El error ocurre después de la segunda petición'],
  ['The issue seems related to state synchronization', 'El problema parece relacionado con la sincronización de estado'],
  ['I verified the fix by testing...', 'Verifiqué la solución probando...'],
] as const satisfies readonly FlashcardEntry[]

const jobIntroEntries = [
  ['I have X years of experience in...', 'Tengo X años de experiencia en...'],
  ["My background is mostly in... but I've also worked with...", 'Mi experiencia es principalmente en... pero también he trabajado con...'],
  ["I'm particularly strong in...", 'Soy particularmente fuerte en...'],
  ["I'm currently improving my skills in...", 'Actualmente estoy mejorando mis habilidades en...'],
  ['In my last role, I was responsible for...', 'En mi último rol, era responsable de...'],
  ['I worked on a team of X developers', 'Trabajé en un equipo de X desarrolladores'],
  ['I collaborated closely with the product and design teams', 'Colaboré estrechamente con los equipos de producto y diseño'],
  ['The project I am most proud of is...', 'El proyecto del que más orgulloso estoy es...'],
  ['What excites me most about this role is...', 'Lo que más me entusiasma de este rol es...'],
  ['The next step I want in my career is...', 'El siguiente paso que quiero en mi carrera es...'],
] as const satisfies readonly FlashcardEntry[]

const systemDesignEntries = [
  ['We could scale this horizontally by...', 'Podríamos escalar esto horizontalmente...'],
  ['The main concern here is availability vs. consistency', 'La principal preocupación aquí es disponibilidad vs. consistencia'],
  ["I'd use a cache layer to reduce database load", 'Usaría una capa de caché para reducir la carga de la base de datos'],
  ['For this use case, a microservices architecture makes sense because...', 'Para este caso de uso, una arquitectura de microservicios tiene sentido porque...'],
  ['The single point of failure here would be...', 'El único punto de falla aquí sería...'],
  ["I'd add a load balancer in front of...", 'Añadiría un balanceador de carga delante de...'],
  ['We should think about read replicas here', 'Deberíamos pensar en réplicas de lectura aquí'],
  ['The write throughput might become a problem', 'El throughput de escritura podría convertirse en un problema'],
  ['A message queue would help decouple...', 'Una cola de mensajes ayudaría a desacoplar...'],
  ['We would need monitoring and alerting for...', 'Necesitaríamos monitoreo y alertas para...'],
] as const satisfies readonly FlashcardEntry[]

const behavioralEntries = [
  ['The situation was...', 'La situación fue...'],
  ['My responsibility was to...', 'Mi responsabilidad era...'],
  ['The challenge was...', 'El desafío fue...'],
  ['What I did was...', 'Lo que hice fue...'],
  ['I decided to...', 'Decidí...'],
  ['As a result, we...', 'Como resultado, nosotros...'],
  ['The outcome was...', 'El resultado fue...'],
  ['What I learned from that experience was...', 'Lo que aprendí de esa experiencia fue...'],
] as const satisfies readonly FlashcardEntry[]

const interviewRecoveryEntries = [
  ["That's a great question. Let me think for a moment...", 'Esa es una gran pregunta. Déjame pensar un momento...'],
  ["I haven't worked with that specifically, but I'm familiar with similar concepts", 'No he trabajado específicamente con eso, pero estoy familiarizado con conceptos similares'],
  ["I'm not 100% sure, but my instinct would be to...", 'No estoy 100% seguro, pero mi instinto sería...'],
  ['Could you give me a bit more context about the use case?', '¿Podrías darme un poco más de contexto sobre el caso de uso?'],
  ['I would start by clarifying...', 'Empezaría aclarando...'],
  ['I would want to verify my assumptions before answering fully', 'Querría verificar mis supuestos antes de responder por completo'],
] as const satisfies readonly FlashcardEntry[]

const meetingsEntries = [
  ['Yesterday I finished...', 'Ayer terminé...'],
  ['Today I am focusing on...', 'Hoy me estoy enfocando en...'],
  ['I am blocked by...', 'Estoy bloqueado por...'],
  ['There are no blockers on my side', 'No hay bloqueos de mi lado'],
  ['I need alignment on...', 'Necesito alineación sobre...'],
  ['Can we park that topic for later?', '¿Podemos dejar ese tema para más tarde?'],
  ['Let me summarize the decision', 'Déjame resumir la decisión'],
  ['The main action item is...', 'La acción principal es...'],
  ['I will follow up after this meeting', 'Daré seguimiento después de esta reunión'],
  ['Could we keep this discussion async?', '¿Podríamos mantener esta discusión de forma asíncrona?'],
] as const satisfies readonly FlashcardEntry[]

const backendEntries = [
  ['This endpoint returns...', 'Este endpoint retorna...'],
  ['The payload includes...', 'El payload incluye...'],
  ['We need to validate the request body', 'Necesitamos validar el cuerpo de la petición'],
  ['The API should respond with a 404 here', 'La API debería responder con un 404 aquí'],
  ['This query is too expensive', 'Esta consulta es demasiado costosa'],
  ['We should paginate this list', 'Deberíamos paginar esta lista'],
  ['The service times out after...', 'El servicio expira después de...'],
  ['We need idempotency for this operation', 'Necesitamos idempotencia para esta operación'],
  ['The schema changed in the latest migration', 'El esquema cambió en la última migración'],
  ['We should cache this response', 'Deberíamos cachear esta respuesta'],
] as const satisfies readonly FlashcardEntry[]

const frontendEntries = [
  ['The component rerenders too often', 'El componente se vuelve a renderizar demasiado seguido'],
  ['The state is getting out of sync', 'El estado se está desincronizando'],
  ['This modal should close on submit', 'Este modal debería cerrarse al enviar'],
  ['The layout breaks on smaller screens', 'El layout se rompe en pantallas más pequeñas'],
  ['We need a loading state here', 'Necesitamos un estado de carga aquí'],
  ['The button should be disabled until...', 'El botón debería estar deshabilitado hasta que...'],
  ['This interaction feels confusing', 'Esta interacción se siente confusa'],
  ['The form needs better validation feedback', 'El formulario necesita mejor feedback de validación'],
  ['The design system already has a component for this', 'El sistema de diseño ya tiene un componente para esto'],
  ['We should improve the empty state', 'Deberíamos mejorar el estado vacío'],
] as const satisfies readonly FlashcardEntry[]

const testingEntries = [
  ['This test is flaky', 'Esta prueba es inestable/intermitente'],
  ['We need better coverage around...', 'Necesitamos mejor cobertura alrededor de...'],
  ['The failing test helped us catch...', 'La prueba fallida nos ayudó a detectar...'],
  ['I added an integration test for...', 'Agregué una prueba de integración para...'],
  ['The mock does not reflect the real behavior', 'El mock no refleja el comportamiento real'],
  ['This should be tested as an edge case', 'Esto debería probarse como un caso límite'],
  ['The regression came from...', 'La regresión vino de...'],
  ['We should test the unhappy path too', 'Deberíamos probar también el caso negativo'],
  ['The assertion is too broad', 'La aserción es demasiado amplia'],
  ['This bug should be covered by an end-to-end test', 'Este bug debería estar cubierto por una prueba end-to-end'],
] as const satisfies readonly FlashcardEntry[]

const releaseEntries = [
  ['The deployment failed because...', 'El despliegue falló porque...'],
  ['We rolled back the release', 'Hicimos rollback del release'],
  ['The hotfix is already in production', 'El hotfix ya está en producción'],
  ['We should deploy this behind a feature flag', 'Deberíamos desplegar esto detrás de una feature flag'],
  ['The release is blocked by...', 'El release está bloqueado por...'],
  ['We need to monitor the rollout closely', 'Necesitamos monitorear el rollout de cerca'],
  ['The migration needs to happen before deploy', 'La migración debe ocurrir antes del deploy'],
  ['This change is safe to release gradually', 'Este cambio es seguro para liberar gradualmente'],
  ['We are seeing elevated error rates after the deploy', 'Estamos viendo tasas de error elevadas después del deploy'],
  ['The incident started right after the release', 'El incidente empezó justo después del release'],
] as const satisfies readonly FlashcardEntry[]

const teamworkEntries = [
  ['I aligned with the backend team on...', 'Me alineé con el equipo de backend sobre...'],
  ['We need input from design before moving forward', 'Necesitamos input de diseño antes de seguir'],
  ['I disagree with the approach because...', 'No estoy de acuerdo con el enfoque porque...'],
  ['I see your point, but I am worried about...', 'Entiendo tu punto, pero me preocupa...'],
  ['Can we split this into smaller tasks?', '¿Podemos dividir esto en tareas más pequeñas?'],
  ['I can take ownership of this part', 'Puedo hacerme cargo de esta parte'],
  ['Let us document the decision so everyone has context', 'Documentemos la decisión para que todos tengan contexto'],
  ['We should involve QA early in this flow', 'Deberíamos involucrar a QA temprano en este flujo'],
  ['This is a dependency for another team', 'Esto es una dependencia para otro equipo'],
  ['Thanks for flagging that risk', 'Gracias por señalar ese riesgo'],
] as const satisfies readonly FlashcardEntry[]

const securityEntries = [
  ['We should not expose this token on the client', 'No deberíamos exponer este token en el cliente'],
  ['This endpoint needs proper authorization', 'Este endpoint necesita autorización adecuada'],
  ['We need to sanitize this user input', 'Necesitamos sanitizar esta entrada de usuario'],
  ['The secret should come from the environment', 'El secreto debería venir del entorno'],
  ['We should rotate the credentials', 'Deberíamos rotar las credenciales'],
  ['This change could create a security risk', 'Este cambio podría crear un riesgo de seguridad'],
  ['The system needs better audit logs', 'El sistema necesita mejores logs de auditoría'],
  ['We should rate-limit this endpoint', 'Deberíamos aplicar rate limiting a este endpoint'],
] as const satisfies readonly FlashcardEntry[]

const phrasalVerbsEntries = [
  ['spin up a service', "iniciar / levantar un servicio (ej: \"We need to spin up a new container\")"],
  ['take ownership', "asumir la responsabilidad de algo (ej: \"I'll take ownership of this feature\")"],
  ['reach out', "contactar a alguien (ej: \"Reach out to the design team for clarification\")"],
  ['circle back', "retomar un tema más tarde (ej: \"Let's circle back on this after the standup\")"],
  ['ship it', "lanzar / deployar algo (ej: \"The feature is ready to ship\")"],
  ['kick off', "comenzar algo (ej: \"Let's kick off the sprint planning\")"],
  ['drill down', "profundizar en un tema (ej: \"We need to drill down into the performance issue\")"],
  ['hand off', "entregar una tarea a otro (ej: \"I'll hand off this ticket to you tomorrow\")"],
  ['wrap up', "terminar / concluir (ej: \"Let's wrap up this meeting in 5 minutes\")"],
  ['pull in', "incluir a alguien en una tarea (ej: \"We should pull in the security team\")"],
  ['sign off on', "aprobar formalmente algo (ej: \"The PM needs to sign off on this spec\")"],
  ['fall back on', "usar como alternativa (ej: \"We can fall back on the cached version\")"],
  ['roll out', "desplegar gradualmente (ej: \"We're rolling out the feature to 10% of users\")"],
  ['roll back', "revertir un cambio (ej: \"We had to roll back the release\")"],
  ['flag up / flag something', "señalar un problema (ej: \"I want to flag up a risk with this approach\")"],
  ['keep someone in the loop', "mantener a alguien informado (ej: \"Keep me in the loop on this PR\")"],
  ['get on the same page', "asegurarse de que todos entiendan lo mismo (ej: \"Let's get on the same page before the demo\")"],
  ['move the needle', "generar impacto real (ej: \"This refactor won't move the needle on performance\")"],
  ['push back', "resistirse u objetar (ej: \"I'm going to push back on that timeline\")"],
  ['onboard', "incorporar a alguien al equipo o sistema (ej: \"We need to onboard the new developer\")"],
] as const satisfies readonly FlashcardEntry[]

export const FLASHCARD_CATEGORIES = Object.values(FLASHCARD_CATEGORY)

export const FLASHCARDS: Flashcard[] = [
  ...buildCards('dw', FLASHCARD_CATEGORY.DESCRIBING_WORK, describingWorkEntries),
  ...buildCards('ac', FLASHCARD_CATEGORY.ASKING_CLARIFYING, askingClarifyingEntries),
  ...buildCards('wk', FLASHCARD_CATEGORY.UNKNOWN_WORDS, unknownWordsEntries),
  ...buildCards('cr', FLASHCARD_CATEGORY.CODE_REVIEWS, codeReviewEntries),
  ...buildCards('at', FLASHCARD_CATEGORY.ARCHITECTURE, architectureEntries),
  ...buildCards('dp', FLASHCARD_CATEGORY.DEBUGGING, debuggingEntries),
  ...buildCards('ji', FLASHCARD_CATEGORY.JOB_INTRO, jobIntroEntries),
  ...buildCards('sd', FLASHCARD_CATEGORY.SYSTEM_DESIGN, systemDesignEntries),
  ...buildCards('bi', FLASHCARD_CATEGORY.BEHAVIORAL, behavioralEntries),
  ...buildCards('wi', FLASHCARD_CATEGORY.INTERVIEW_RECOVERY, interviewRecoveryEntries),
  ...buildCards('mt', FLASHCARD_CATEGORY.MEETINGS, meetingsEntries),
  ...buildCards('ba', FLASHCARD_CATEGORY.BACKEND_APIS, backendEntries),
  ...buildCards('fe', FLASHCARD_CATEGORY.FRONTEND_UI, frontendEntries),
  ...buildCards('qa', FLASHCARD_CATEGORY.TESTING_QA, testingEntries),
  ...buildCards('rl', FLASHCARD_CATEGORY.RELEASES, releaseEntries),
  ...buildCards('tw', FLASHCARD_CATEGORY.TEAMWORK, teamworkEntries),
  ...buildCards('sr', FLASHCARD_CATEGORY.SECURITY, securityEntries),
  ...buildCards('pv', FLASHCARD_CATEGORY.PHRASAL_VERBS, phrasalVerbsEntries),
]
