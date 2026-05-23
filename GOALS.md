# IF YOU ARE AN AI AGENT, DON'T IMPLEMENT THIS FEATURE; SKIP FILE

[ ] generare mock data per storico dei lavori ( 20 in totale )

[ ] Il tempo previsto per la realizzazione deve essere dettagliato al giorno ( ad esempio 1 settimana e 3 giorni di lavoro ). 


[ ] Perfetto, l'errore è stato risolto ed il preventivo è stato generato con successo.

[ ] Voglio effettuare una modifica alla pagina "/admin/rate-card". La modifica consiste nel fatto che io voglio poter aver la possibilità modificare ogni singola cella del tariffario una volta cliccato sul pulsante, che deve essere aggiunto, "Modifica". Per la colonna "stato" devo poter selezionare tra "attivo" e "inattivo".


[ ] Anche quando clicco il pulsante "rispondi e ricalcola" con la risposta ad una domanda voglio che come per la fase di generazione dei preventivi ci sia un pop up che mi tiene aggiornato sullo stato dell'aggiornamento ( prendi quello come esempio e personalizza le voci )


[ ] Controllare coerenza tra budget disponibile e budget proposto da preventivo


[ ] Il problema persiste, tutto viene aggiornato correttamente dall'esterno nella pagina "/requests/id" però come vedi dallo screenshot una volta entrato nella pagina "/requests/id/scenarios/altroId" tutti i valori sono a zero.


[ ] 
[ ] 
[ ] 
[ ] 
[ ] 
[ ] 
[ ] 
[ ] 


Quando si modifica un preventivo manualmente ci sono i seguenti errori da terminale: """[browser] [ScenarioDetail] recalculateScenario fallback: PricingError: Invalid effort bounds for Full-Stack / Backend Developer: min <= expected <= max is required.
    at assertEffortBounds (src/lib/quotes/pricing-engine.ts:283:11)
    at <unknown> (src/lib/quotes/pricing-engine.ts:147:5)
    at Array.map (<anonymous>)
    at priceTask (src/lib/quotes/pricing-engine.ts:146:32)
    at <unknown> (src/lib/quotes/pricing-engine.ts:41:28)
    at Array.map (<anonymous>)
    at <unknown> (src/lib/quotes/pricing-engine.ts:40:34)
    at Array.map (<anonymous>)
    at <unknown> (src/lib/quotes/pricing-engine.ts:35:38)
    at Array.map (<anonymous>)
    at priceScenarios (src/lib/quotes/pricing-engine.ts:34:26)
    at recalculateScenario (src/lib/quotes/pricing-engine.ts:81:20)
    at ScenarioDetailClient.useMemo[recalculated] (components/quote/scenario-detail-client.tsx:83:33)
    at ScenarioDetailClient (components/quote/scenario-detail-client.tsx:79:31)
  281 |     effort.estimatedHoursExpected > effort.estimatedHoursMax
  282 |   ) {
> 283 |     throw new PricingError(
      |           ^
  284 |       `Invalid effort bounds for ${effort.roleName}: min <= expected <= max is required.`,
  285 |     );
  286 |   } (components/quote/scenario-detail-client.tsx:92:15)""" e questo da browser console: """forward-logs-shared.ts:95 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
forward-logs-shared.ts:95 [HMR] connected
scenario-detail-client.tsx:92 [ScenarioDetail] recalculateScenario fallback: PricingError: Invalid effort bounds for Full-Stack / Backend Developer: min <= expected <= max is required.
    at assertEffortBounds (pricing-engine.ts:283:11)
    at pricing-engine.ts:147:5
    at Array.map (<anonymous>)
    at priceTask (pricing-engine.ts:146:32)
    at pricing-engine.ts:41:28
    at Array.map (<anonymous>)
    at pricing-engine.ts:40:34
    at Array.map (<anonymous>)
    at pricing-engine.ts:35:38
    at Array.map (<anonymous>)
    at priceScenarios (pricing-engine.ts:34:26)
    at recalculateScenario (pricing-engine.ts:81:20)
    at ScenarioDetailClient.useMemo[recalculated] (scenario-detail-client.tsx:83:33)
    at updateMemo (react-dom-client.development.js:9060:19)
    at Object.useMemo (react-dom-client.development.js:28821:18)
    at react.development.js:1297:34
    at ScenarioDetailClient (scenario-detail-client.tsx:79:31)
    at Object.react_stack_bottom_frame (react-dom-client.development.js:28241:20)
    at renderWithHooks (react-dom-client.development.js:7925:22)
    at updateFunctionComponent (react-dom-client.development.js:10442:19)
    at beginWork (react-dom-client.development.js:12112:18)
    at runWithFiberInDEV (react-dom-client.development.js:986:30)
    at performUnitOfWork (react-dom-client.development.js:18988:22)
    at workLoopSync (react-dom-client.development.js:18816:41)
    at renderRootSync (react-dom-client.development.js:18797:11)
    at performWorkOnRoot (react-dom-client.development.js:17823:11)
    at performSyncWorkOnRoot (react-dom-client.development.js:20486:7)
    at flushSyncWorkAcrossRoots_impl (react-dom-client.development.js:20328:21)
    at flushSyncWork$1 (react-dom-client.development.js:18243:12)
    at batchedUpdates$1 (react-dom-client.development.js:3385:14)
    at dispatchEventForPluginEventSystem (react-dom-client.development.js:20814:7)
    at dispatchEvent (react-dom-client.development.js:25817:11)
    at dispatchDiscreteEvent (react-dom-client.development.js:25785:11)
(anonymous) @ forward-logs-shared.ts:95
(anonymous) @ scenario-detail-client.tsx:92
updateMemo @ react-dom-client.development.js:9060
useMemo @ react-dom-client.development.js:28821
(anonymous) @ react.development.js:1297
ScenarioDetailClient @ scenario-detail-client.tsx:79
react_stack_bottom_frame @ react-dom-client.development.js:28241
renderWithHooks @ react-dom-client.development.js:7925
updateFunctionComponent @ react-dom-client.development.js:10442
beginWork @ react-dom-client.development.js:12112
runWithFiberInDEV @ react-dom-client.development.js:986
performUnitOfWork @ react-dom-client.development.js:18988
workLoopSync @ react-dom-client.development.js:18816
renderRootSync @ react-dom-client.development.js:18797
performWorkOnRoot @ react-dom-client.development.js:17823
performSyncWorkOnRoot @ react-dom-client.development.js:20486
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:20328
flushSyncWork$1 @ react-dom-client.development.js:18243
batchedUpdates$1 @ react-dom-client.development.js:3385
dispatchEventForPluginEventSystem @ react-dom-client.development.js:20814
dispatchEvent @ react-dom-client.development.js:25817
dispatchDiscreteEvent @ react-dom-client.development.js:25785
"use client"
(anonymous) @ page.tsx:19
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1975
reviveModel @ react-server-dom-turbopack-client.browser.development.js:4702
parseModel @ react-server-dom-turbopack-client.browser.development.js:4622
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1860
resolveModelChunk @ react-server-dom-turbopack-client.browser.development.js:1700
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4512
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4370
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4593
progress @ react-server-dom-turbopack-client.browser.development.js:4924
<ScenarioDetailPage>
Promise.all @ VM2419 <anonymous>:1
Promise.all @ VM2419 <anonymous>:1
initializeFakeTask @ react-server-dom-turbopack-client.browser.development.js:3454
initializeDebugInfo @ react-server-dom-turbopack-client.browser.development.js:3479
initializeDebugChunk @ react-server-dom-turbopack-client.browser.development.js:1802
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4459
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4370
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4593
progress @ react-server-dom-turbopack-client.browser.development.js:4924
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2833
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4788
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:5158
createFromNextFetch @ fetch-server-response.ts:631
createFetch @ fetch-server-response.ts:512
await in createFetch
fetchServerResponse @ fetch-server-response.ts:186
navigateToUnknownRoute @ navigation.ts:395
navigateImpl @ navigation.ts:180
navigate @ navigation.ts:88
navigateReducer @ navigate-reducer.ts:44
clientReducer @ router-reducer.ts:30
(anonymous) @ app-router-instance.ts:229
runAction @ app-router-instance.ts:109
dispatchAction @ app-router-instance.ts:186
(anonymous) @ app-router-instance.ts:227
(anonymous) @ use-action-queue.ts:94
startTransition @ react-dom-client.development.js:9151
(anonymous) @ use-action-queue.ts:93
dispatchAppRouterAction @ use-action-queue.ts:39
dispatchNavigateAction @ app-router-instance.ts:306
(anonymous) @ link.tsx:308
startTransition @ react.development.js:554
linkClicked @ link.tsx:307
onClick @ link.tsx:669
executeDispatch @ react-dom-client.development.js:20610
runWithFiberInDEV @ react-dom-client.development.js:986
processDispatchQueue @ react-dom-client.development.js:20660
(anonymous) @ react-dom-client.development.js:21234
batchedUpdates$1 @ react-dom-client.development.js:3377
dispatchEventForPluginEventSystem @ react-dom-client.development.js:20814
dispatchEvent @ react-dom-client.development.js:25817
dispatchDiscreteEvent @ react-dom-client.development.js:25785
<a>
(anonymous) @ react-jsx-runtime.development.js:342
LinkComponent @ link.tsx:760
react_stack_bottom_frame @ react-dom-client.development.js:28241
renderWithHooksAgain @ react-dom-client.development.js:8025
renderWithHooks @ react-dom-client.development.js:7937
updateFunctionComponent @ react-dom-client.development.js:10442
beginWork @ react-dom-client.development.js:12112
runWithFiberInDEV @ react-dom-client.development.js:986
performUnitOfWork @ react-dom-client.development.js:18988
workLoopConcurrentByScheduler @ react-dom-client.development.js:18982
renderRootConcurrent @ react-dom-client.development.js:18964
performWorkOnRoot @ react-dom-client.development.js:17822
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20471
performWorkUntilDeadline @ scheduler.development.js:45
<LinkComponent>
(anonymous) @ react-jsx-dev-runtime.development.js:342
ButtonLink @ button.tsx:42
react_stack_bottom_frame @ react-dom-client.development.js:28241
renderWithHooksAgain @ react-dom-client.development.js:8025
renderWithHooks @ react-dom-client.development.js:7937
updateFunctionComponent @ react-dom-client.development.js:10442
beginWork @ react-dom-client.development.js:12112
runWithFiberInDEV @ react-dom-client.development.js:986
performUnitOfWork @ react-dom-client.development.js:18988
workLoopConcurrentByScheduler @ react-dom-client.development.js:18982
renderRootConcurrent @ react-dom-client.development.js:18964
performWorkOnRoot @ react-dom-client.development.js:17822
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20471
performWorkUntilDeadline @ scheduler.development.js:45
<ButtonLink>
(anonymous) @ react-jsx-dev-runtime.development.js:342
(anonymous) @ scenario-dashboard.tsx:178
ScenarioDashboard @ scenario-dashboard.tsx:134
react_stack_bottom_frame @ react-dom-client.development.js:28241
renderWithHooksAgain @ react-dom-client.development.js:8025
renderWithHooks @ react-dom-client.development.js:7937
updateFunctionComponent @ react-dom-client.development.js:10442
beginWork @ react-dom-client.development.js:12052
runWithFiberInDEV @ react-dom-client.development.js:986
performUnitOfWork @ react-dom-client.development.js:18988
workLoopConcurrentByScheduler @ react-dom-client.development.js:18982
renderRootConcurrent @ react-dom-client.development.js:18964
performWorkOnRoot @ react-dom-client.development.js:17822
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20471
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
(anonymous) @ page.tsx:34
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1975
reviveModel @ react-server-dom-turbopack-client.browser.development.js:4702
parseModel @ react-server-dom-turbopack-client.browser.development.js:4622
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1860
resolveModelChunk @ react-server-dom-turbopack-client.browser.development.js:1700
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4512
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4370
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4593
progress @ react-server-dom-turbopack-client.browser.development.js:4924
<RequestDetailPage>
Promise.all @ VM2419 <anonymous>:1
initializeFakeTask @ react-server-dom-turbopack-client.browser.development.js:3454
initializeDebugInfo @ react-server-dom-turbopack-client.browser.development.js:3479
initializeDebugChunk @ react-server-dom-turbopack-client.browser.development.js:1802
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4459
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4370
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4593
progress @ react-server-dom-turbopack-client.browser.development.js:4924
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2833
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4788
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:5158
createFromNextFetch @ fetch-server-response.ts:631
createFetch @ fetch-server-response.ts:512
await in createFetch
fetchServerResponse @ fetch-server-response.ts:186
navigateToUnknownRoute @ navigation.ts:395
navigateImpl @ navigation.ts:180
navigate @ navigation.ts:88
navigateReducer @ navigate-reducer.ts:44
clientReducer @ router-reducer.ts:30
(anonymous) @ app-router-instance.ts:229
runAction @ app-router-instance.ts:109
dispatchAction @ app-router-instance.ts:186
(anonymous) @ app-router-instance.ts:227
(anonymous) @ use-action-queue.ts:94
startTransition @ react-dom-client.development.js:9151
(anonymous) @ use-action-queue.ts:93
dispatchAppRouterAction @ use-action-queue.ts:39
dispatchNavigateAction @ app-router-instance.ts:306
(anonymous) @ link.tsx:308
startTransition @ react.development.js:554
linkClicked @ link.tsx:307
onClick @ link.tsx:669
executeDispatch @ react-dom-client.development.js:20610
runWithFiberInDEV @ react-dom-client.development.js:986
processDispatchQueue @ react-dom-client.development.js:20660
(anonymous) @ react-dom-client.development.js:21234
batchedUpdates$1 @ react-dom-client.development.js:3377
dispatchEventForPluginEventSystem @ react-dom-client.development.js:20814
dispatchEvent @ react-dom-client.development.js:25817
dispatchDiscreteEvent @ react-dom-client.development.js:25785
<a>
(anonymous) @ react-jsx-runtime.development.js:342
LinkComponent @ link.tsx:760
react_stack_bottom_frame @ react-dom-client.development.js:28241
renderWithHooksAgain @ react-dom-client.development.js:8025
renderWithHooks @ react-dom-client.development.js:7937
updateFunctionComponent @ react-dom-client.development.js:10442
beginWork @ react-dom-client.development.js:12112
runWithFiberInDEV @ react-dom-client.development.js:986
performUnitOfWork @ react-dom-client.development.js:18988
workLoopSync @ react-dom-client.development.js:18816
renderRootSync @ react-dom-client.development.js:18797
performWorkOnRoot @ react-dom-client.development.js:17823
performSyncWorkOnRoot @ react-dom-client.development.js:20486
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:20328
processRootScheduleInMicrotask @ react-dom-client.development.js:20367
(anonymous) @ react-dom-client.development.js:20505
<LinkComponent>
(anonymous) @ react-jsx-dev-runtime.development.js:342
ButtonLink @ button.tsx:42
react_stack_bottom_frame @ react-dom-client.development.js:28241
renderWithHooksAgain @ react-dom-client.development.js:8025
renderWithHooks @ react-dom-client.development.js:7937
updateFunctionComponent @ react-dom-client.development.js:10442
beginWork @ react-dom-client.development.js:12112
runWithFiberInDEV @ react-dom-client.development.js:986
performUnitOfWork @ react-dom-client.development.js:18988
workLoopSync @ react-dom-client.development.js:18816
renderRootSync @ react-dom-client.development.js:18797
performWorkOnRoot @ react-dom-client.development.js:17823
performSyncWorkOnRoot @ react-dom-client.development.js:20486
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:20328
processRootScheduleInMicrotask @ react-dom-client.development.js:20367
(anonymous) @ react-dom-client.development.js:20505
<ButtonLink>
(anonymous) @ react-jsx-dev-runtime.development.js:342
(anonymous) @ request-list-client.tsx:77
RequestListClient @ request-list-client.tsx:39
react_stack_bottom_frame @ react-dom-client.development.js:28241
renderWithHooksAgain @ react-dom-client.development.js:8025
renderWithHooks @ react-dom-client.development.js:7937
updateFunctionComponent @ react-dom-client.development.js:10442
beginWork @ react-dom-client.development.js:12052
runWithFiberInDEV @ react-dom-client.development.js:986
performUnitOfWork @ react-dom-client.development.js:18988
workLoopSync @ react-dom-client.development.js:18816
renderRootSync @ react-dom-client.development.js:18797
performWorkOnRoot @ react-dom-client.development.js:17823
performSyncWorkOnRoot @ react-dom-client.development.js:20486
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:20328
processRootScheduleInMicrotask @ react-dom-client.development.js:20367
(anonymous) @ react-dom-client.development.js:20505
scenario-detail-client.tsx:92 [ScenarioDetail] recalculateScenario fallback: PricingError: Invalid effort bounds for Full-Stack / Backend Developer: min <= expected <= max is required.
    at assertEffortBounds (pricing-engine.ts:283:11)
    at pricing-engine.ts:147:5
    at Array.map (<anonymous>)
    at priceTask (pricing-engine.ts:146:32)
    at pricing-engine.ts:41:28
    at Array.map (<anonymous>)
    at pricing-engine.ts:40:34
    at Array.map (<anonymous>)
    at pricing-engine.ts:35:38
    at Array.map (<anonymous>)
    at priceScenarios (pricing-engine.ts:34:26)
    at recalculateScenario (pricing-engine.ts:81:20)
    at ScenarioDetailClient.useMemo[recalculated] (scenario-detail-client.tsx:83:33)
    at updateMemo (react-dom-client.development.js:9064:11)
    at Object.useMemo (react-dom-client.development.js:28821:18)
    at react.development.js:1297:34
    at ScenarioDetailClient (scenario-detail-client.tsx:79:31)
    at Object.react_stack_bottom_frame (react-dom-client.development.js:28241:20)
    at renderWithHooks (react-dom-client.development.js:7925:22)
    at updateFunctionComponent (react-dom-client.development.js:10442:19)
    at beginWork (react-dom-client.development.js:12112:18)
    at runWithFiberInDEV (react-dom-client.development.js:986:30)
    at performUnitOfWork (react-dom-client.development.js:18988:22)
    at workLoopSync (react-dom-client.development.js:18816:41)
    at renderRootSync (react-dom-client.development.js:18797:11)
    at performWorkOnRoot (react-dom-client.development.js:17823:11)
    at performSyncWorkOnRoot (react-dom-client.development.js:20486:7)
    at flushSyncWorkAcrossRoots_impl (react-dom-client.development.js:20328:21)
    at flushSyncWork$1 (react-dom-client.development.js:18243:12)
    at batchedUpdates$1 (react-dom-client.development.js:3385:14)
    at dispatchEventForPluginEventSystem (react-dom-client.development.js:20814:7)
    at dispatchEvent (react-dom-client.development.js:25817:11)
    at dispatchDiscreteEvent (react-dom-client.development.js:25785:11)
(anonymous) @ forward-logs-shared.ts:95
(anonymous) @ scenario-detail-client.tsx:92
updateMemo @ react-dom-client.development.js:9064
useMemo @ react-dom-client.development.js:28821
(anonymous) @ react.development.js:1297
ScenarioDetailClient @ scenario-detail-client.tsx:79
react_stack_bottom_frame @ react-dom-client.development.js:28241
renderWithHooks @ react-dom-client.development.js:7925
updateFunctionComponent @ react-dom-client.development.js:10442
beginWork @ react-dom-client.development.js:12112
runWithFiberInDEV @ react-dom-client.development.js:986
performUnitOfWork @ react-dom-client.development.js:18988
workLoopSync @ react-dom-client.development.js:18816
renderRootSync @ react-dom-client.development.js:18797
performWorkOnRoot @ react-dom-client.development.js:17823
performSyncWorkOnRoot @ react-dom-client.development.js:20486
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:20328
flushSyncWork$1 @ react-dom-client.development.js:18243
batchedUpdates$1 @ react-dom-client.development.js:3385
dispatchEventForPluginEventSystem @ react-dom-client.development.js:20814
dispatchEvent @ react-dom-client.development.js:25817
dispatchDiscreteEvent @ react-dom-client.development.js:25785
"use client"
(anonymous) @ page.tsx:19
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1975
reviveModel @ react-server-dom-turbopack-client.browser.development.js:4702
parseModel @ react-server-dom-turbopack-client.browser.development.js:4622
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1860
resolveModelChunk @ react-server-dom-turbopack-client.browser.development.js:1700
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4512
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4370
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4593
progress @ react-server-dom-turbopack-client.browser.development.js:4924
<ScenarioDetailPage>
Promise.all @ VM2419 <anonymous>:1
Promise.all @ VM2419 <anonymous>:1
initializeFakeTask @ react-server-dom-turbopack-client.browser.development.js:3454
initializeDebugInfo @ react-server-dom-turbopack-client.browser.development.js:3479
initializeDebugChunk @ react-server-dom-turbopack-client.browser.development.js:1802
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4459
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4370
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4593
progress @ react-server-dom-turbopack-client.browser.development.js:4924
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2833
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4788
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:5158
createFromNextFetch @ fetch-server-response.ts:631
createFetch @ fetch-server-response.ts:512
await in createFetch
fetchServerResponse @ fetch-server-response.ts:186
navigateToUnknownRoute @ navigation.ts:395
navigateImpl @ navigation.ts:180
navigate @ navigation.ts:88
navigateReducer @ navigate-reducer.ts:44
clientReducer @ router-reducer.ts:30
(anonymous) @ app-router-instance.ts:229
runAction @ app-router-instance.ts:109
dispatchAction @ app-router-instance.ts:186
(anonymous) @ app-router-instance.ts:227
(anonymous) @ use-action-queue.ts:94
startTransition @ react-dom-client.development.js:9151
(anonymous) @ use-action-queue.ts:93
dispatchAppRouterAction @ use-action-queue.ts:39
dispatchNavigateAction @ app-router-instance.ts:306
(anonymous) @ link.tsx:308
startTransition @ react.development.js:554
linkClicked @ link.tsx:307
onClick @ link.tsx:669
executeDispatch @ react-dom-client.development.js:20610
runWithFiberInDEV @ react-dom-client.development.js:986
processDispatchQueue @ react-dom-client.development.js:20660
(anonymous) @ react-dom-client.development.js:21234
batchedUpdates$1 @ react-dom-client.development.js:3377
dispatchEventForPluginEventSystem @ react-dom-client.development.js:20814
dispatchEvent @ react-dom-client.development.js:25817
dispatchDiscreteEvent @ react-dom-client.development.js:25785
<a>
(anonymous) @ react-jsx-runtime.development.js:342
LinkComponent @ link.tsx:760
react_stack_bottom_frame @ react-dom-client.development.js:28241
renderWithHooksAgain @ react-dom-client.development.js:8025
renderWithHooks @ react-dom-client.development.js:7937
updateFunctionComponent @ react-dom-client.development.js:10442
beginWork @ react-dom-client.development.js:12112
runWithFiberInDEV @ react-dom-client.development.js:986
performUnitOfWork @ react-dom-client.development.js:18988
workLoopConcurrentByScheduler @ react-dom-client.development.js:18982
renderRootConcurrent @ react-dom-client.development.js:18964
performWorkOnRoot @ react-dom-client.development.js:17822
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20471
performWorkUntilDeadline @ scheduler.development.js:45
<LinkComponent>
(anonymous) @ react-jsx-dev-runtime.development.js:342
ButtonLink @ button.tsx:42
react_stack_bottom_frame @ react-dom-client.development.js:28241
renderWithHooksAgain @ react-dom-client.development.js:8025
renderWithHooks @ react-dom-client.development.js:7937
updateFunctionComponent @ react-dom-client.development.js:10442
beginWork @ react-dom-client.development.js:12112
runWithFiberInDEV @ react-dom-client.development.js:986
performUnitOfWork @ react-dom-client.development.js:18988
workLoopConcurrentByScheduler @ react-dom-client.development.js:18982
renderRootConcurrent @ react-dom-client.development.js:18964
performWorkOnRoot @ react-dom-client.development.js:17822
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20471
performWorkUntilDeadline @ scheduler.development.js:45
<ButtonLink>
(anonymous) @ react-jsx-dev-runtime.development.js:342
(anonymous) @ scenario-dashboard.tsx:178
ScenarioDashboard @ scenario-dashboard.tsx:134
react_stack_bottom_frame @ react-dom-client.development.js:28241
renderWithHooksAgain @ react-dom-client.development.js:8025
renderWithHooks @ react-dom-client.development.js:7937
updateFunctionComponent @ react-dom-client.development.js:10442
beginWork @ react-dom-client.development.js:12052
runWithFiberInDEV @ react-dom-client.development.js:986
performUnitOfWork @ react-dom-client.development.js:18988
workLoopConcurrentByScheduler @ react-dom-client.development.js:18982
renderRootConcurrent @ react-dom-client.development.js:18964
performWorkOnRoot @ react-dom-client.development.js:17822
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20471
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
(anonymous) @ page.tsx:34
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1975
reviveModel @ react-server-dom-turbopack-client.browser.development.js:4702
parseModel @ react-server-dom-turbopack-client.browser.development.js:4622
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1860
resolveModelChunk @ react-server-dom-turbopack-client.browser.development.js:1700
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4512
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4370
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4593
progress @ react-server-dom-turbopack-client.browser.development.js:4924
<RequestDetailPage>
Promise.all @ VM2419 <anonymous>:1
initializeFakeTask @ react-server-dom-turbopack-client.browser.development.js:3454
initializeDebugInfo @ react-server-dom-turbopack-client.browser.development.js:3479
initializeDebugChunk @ react-server-dom-turbopack-client.browser.development.js:1802
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4459
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4370
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4593
progress @ react-server-dom-turbopack-client.browser.development.js:4924
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2833
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4788
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:5158
createFromNextFetch @ fetch-server-response.ts:631
createFetch @ fetch-server-response.ts:512
await in createFetch
fetchServerResponse @ fetch-server-response.ts:186
navigateToUnknownRoute @ navigation.ts:395
navigateImpl @ navigation.ts:180
navigate @ navigation.ts:88
navigateReducer @ navigate-reducer.ts:44
clientReducer @ router-reducer.ts:30
(anonymous) @ app-router-instance.ts:229
runAction @ app-router-instance.ts:109
dispatchAction @ app-router-instance.ts:186
(anonymous) @ app-router-instance.ts:227
(anonymous) @ use-action-queue.ts:94
startTransition @ react-dom-client.development.js:9151
(anonymous) @ use-action-queue.ts:93
dispatchAppRouterAction @ use-action-queue.ts:39
dispatchNavigateAction @ app-router-instance.ts:306
(anonymous) @ link.tsx:308
startTransition @ react.development.js:554
linkClicked @ link.tsx:307
onClick @ link.tsx:669
executeDispatch @ react-dom-client.development.js:20610
runWithFiberInDEV @ react-dom-client.development.js:986
processDispatchQueue @ react-dom-client.development.js:20660
(anonymous) @ react-dom-client.development.js:21234
batchedUpdates$1 @ react-dom-client.development.js:3377
dispatchEventForPluginEventSystem @ react-dom-client.development.js:20814
dispatchEvent @ react-dom-client.development.js:25817
dispatchDiscreteEvent @ react-dom-client.development.js:25785
<a>
(anonymous) @ react-jsx-runtime.development.js:342
LinkComponent @ link.tsx:760
react_stack_bottom_frame @ react-dom-client.development.js:28241
renderWithHooksAgain @ react-dom-client.development.js:8025
renderWithHooks @ react-dom-client.development.js:7937
updateFunctionComponent @ react-dom-client.development.js:10442
beginWork @ react-dom-client.development.js:12112
runWithFiberInDEV @ react-dom-client.development.js:986
performUnitOfWork @ react-dom-client.development.js:18988
workLoopSync @ react-dom-client.development.js:18816
renderRootSync @ react-dom-client.development.js:18797
performWorkOnRoot @ react-dom-client.development.js:17823
performSyncWorkOnRoot @ react-dom-client.development.js:20486
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:20328
processRootScheduleInMicrotask @ react-dom-client.development.js:20367
(anonymous) @ react-dom-client.development.js:20505
<LinkComponent>
(anonymous) @ react-jsx-dev-runtime.development.js:342
ButtonLink @ button.tsx:42
react_stack_bottom_frame @ react-dom-client.development.js:28241
renderWithHooksAgain @ react-dom-client.development.js:8025
renderWithHooks @ react-dom-client.development.js:7937
updateFunctionComponent @ react-dom-client.development.js:10442
beginWork @ react-dom-client.development.js:12112
runWithFiberInDEV @ react-dom-client.development.js:986
performUnitOfWork @ react-dom-client.development.js:18988
workLoopSync @ react-dom-client.development.js:18816
renderRootSync @ react-dom-client.development.js:18797
performWorkOnRoot @ react-dom-client.development.js:17823
performSyncWorkOnRoot @ react-dom-client.development.js:20486
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:20328
processRootScheduleInMicrotask @ react-dom-client.development.js:20367
(anonymous) @ react-dom-client.development.js:20505
<ButtonLink>
(anonymous) @ react-jsx-dev-runtime.development.js:342
(anonymous) @ request-list-client.tsx:77
RequestListClient @ request-list-client.tsx:39
react_stack_bottom_frame @ react-dom-client.development.js:28241
renderWithHooksAgain @ react-dom-client.development.js:8025
renderWithHooks @ react-dom-client.development.js:7937
updateFunctionComponent @ react-dom-client.development.js:10442
beginWork @ react-dom-client.development.js:12052
runWithFiberInDEV @ react-dom-client.development.js:986
performUnitOfWork @ react-dom-client.development.js:18988
workLoopSync @ react-dom-client.development.js:18816
renderRootSync @ react-dom-client.development.js:18797
performWorkOnRoot @ react-dom-client.development.js:17823
performSyncWorkOnRoot @ react-dom-client.development.js:20486
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:20328
processRootScheduleInMicrotask @ react-dom-client.development.js:20367
(anonymous) @ react-dom-client.development.js:20505
""".