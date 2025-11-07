        // ===== DOM helpers =====
        const $ = id => document.getElementById(id);
        const qs = sel => document.querySelector(sel);
        const IS_DEMO_MODE = document.body && document.body.classList && document.body.classList.contains('demo-mode');

        function applyDemoInputLock({ wrapper, input, sendBtn, noticeId }) {
            if (!IS_DEMO_MODE || !wrapper) return;

            wrapper.setAttribute('role', 'group');
            wrapper.setAttribute('aria-disabled', 'true');
            wrapper.dataset.demoLocked = 'true';

            if (noticeId && !document.getElementById(noticeId)) {
                const notice = document.createElement('span');
                notice.id = noticeId;
                notice.className = 'sr-only';
                notice.textContent = 'Demo playback only: controls are locked and shown for illustration.';
                wrapper.prepend(notice);
            }

            if (input) {
                input.setAttribute('readonly', 'readonly');
                input.setAttribute('aria-readonly', 'true');
                if (noticeId) {
                    input.setAttribute('aria-describedby', noticeId);
                }
                input.setAttribute('tabindex', '-1');
            }

            if (sendBtn) {
                sendBtn.setAttribute('aria-hidden', 'true');
                sendBtn.setAttribute('tabindex', '-1');
                sendBtn.setAttribute('disabled', 'true');
            }
        }

        // Icon helper function using Lucide Icons
        function renderIcon(iconName, size = 24, color = 'currentColor', className = '') {
            if (typeof lucide === 'undefined') {
                // Fallback to emoji if Lucide not loaded
                const emojiMap = {
                    'target': '🎯',
                    'clipboard': '📋',
                    'alert-triangle': '🚨',
                    'user-circle': '👩‍💼',
                    'code': '💻',
                    'message-circle': '💬',
                    'user': '🧑‍💻',
                    'keyboard': '⌨️',
                    'flask': '🧪',
                    'check-circle': '✅',
                    'party-popper': '🎉',
                    'bot': '🤖',
                    'user-check': '👤',
                    'lightbulb': '💡',
                    'rocket': '🚀',
                };
                return `<span class="icon-emoji ${className}">${emojiMap[iconName] || '💡'}</span>`;
            }
            // Create icon element with Lucide
            return `<i data-lucide="${iconName}" class="lucide-icon ${className}" style="width: ${size}px; height: ${size}px; color: ${color}; display: inline-block; vertical-align: middle;"></i>`;
        }

        // Initialize Lucide icons after DOM updates
        function initIcons(container = document) {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons({ container });
            }
        }

        // Convert emoji string to icon name
        function emojiToIcon(emoji) {
            const emojiMap = {
                '🎯': 'target',
                '📋': 'clipboard',
                '🚨': 'alert-triangle',
                '👩‍💼': 'user-circle',
                '💻': 'code',
                '💬': 'message-circle',
                '🧑‍💻': 'user',
                '⌨️': 'keyboard',
                '🧪': 'flask',
                '✅': 'check-circle',
                '🎉': 'party-popper',
                '🤖': 'bot',
                '👤': 'user-check',
                '💡': 'lightbulb',
                '🚀': 'rocket',
                '⏱️': 'clock',
                '✓': 'check',
                '📝': 'file-text',
                '🔍': 'search',
                '🛠️': 'wrench',
                '✨': 'sparkles',
                '❌': 'x-circle',
            };
            return emojiMap[emoji] || 'lightbulb';
        }

        // Render icon from emoji string or icon name
        function renderIconFromString(iconString, size = 24) {
            // Check if it's already an icon name or an emoji
            if (iconString && iconString.length > 2 && !iconString.match(/[\u{1F300}-\u{1F9FF}]/u)) {
                // It's likely already an icon name
                return renderIcon(iconString, size);
            }
            // It's an emoji, convert it
            const iconName = emojiToIcon(iconString);
            return renderIcon(iconName, size);
        }

        // Check if an agent name indicates an AI agent
        function isAIAgentName(agentName) {
            if (!agentName) return false;
            const aiAgentNames = [
                'Senior Engineer', 'Product Manager', 'Junior Developer', 
                'Incident System', 'Code Assistant AI', 'UI Guide', 'Team Chat',
                'SimuWork AI', 'SimuWork'
            ];
            return aiAgentNames.some(name => agentName.includes(name) || agentName === name);
        }

        // Get agent badge color class
        function getAgentBadgeClass(agentId) {
            const colorMap = {
                'senior_dev': 'badge-senior',
                'pm': 'badge-pm',
                'junior_dev': 'badge-junior',
                'incident': 'badge-incident',
                'code_assistant': 'badge-code-assistant',
            };
            return colorMap[agentId] || 'badge-default';
        }

        // Map agent name to agentId for tooltips
        function getAgentIdFromName(agentName) {
            if (!agentName) return null;
            const nameMap = {
                'Senior Engineer': 'senior_dev',
                'Product Manager': 'pm',
                'Junior Developer': 'junior_dev',
                'Incident System': 'incident',
                'Code Assistant AI': 'code_assistant',
            };
            for (const [name, id] of Object.entries(nameMap)) {
                if (agentName.includes(name)) return id;
            }
            return null;
        }

        // ===== Event types =====
        const ET = {
            USER_CODE_CHANGE: 'ucc',
            USER_RUN_TESTS: 'urt',
            USER_ASK_QUESTION: 'uaq',
            USER_DECISION: 'ud',
            AGENT_CODE_REVIEW: 'acr',
            AGENT_HINT: 'ah',
            AGENT_QUESTION: 'aq',
            SCENARIO_PHASE_CHANGE: 'spc',
            SCENARIO_OBJECTIVE_COMPLETE: 'soc',
            SCENARIO_COMPLETE: 'sc',
            INCIDENT_CREATED: 'ic',
            INCIDENT_ESCALATED: 'ie',
            INCIDENT_RESOLVED: 'ir',
            TESTS_PASSED: 'tp',
            TESTS_FAILED: 'tf',
            TIME_TICK: 'tt',
            SYSTEM_READY: 'sr',
            NARRATION_SHOWN: 'ns',
            NARRATION_HIDDEN: 'nh',
        };

        // ===== Lightweight event bus =====
        class Bus {
            constructor(){this.subscriptions={};this.subscriptionCounter=0;}
            subscribe(eventType,handler,subscriberId='anonymous'){if(!this.subscriptions[eventType]) this.subscriptions[eventType]=[];const subscriptionId=`${subscriberId}_${this.subscriptionCounter++}`;this.subscriptions[eventType].push({id:subscriptionId,handler,subscriberId});return()=>this.unsubscribe(eventType,subscriptionId);}
            unsubscribe(eventType,subscriptionId){if(this.subscriptions[eventType]) this.subscriptions[eventType]=this.subscriptions[eventType].filter(sub=>sub.id!==subscriptionId);}
            publish(eventType,payload={},source='system'){const event={type:eventType,payload,source,timestamp:Date.now()};const subscribers=[...(this.subscriptions[eventType]||[]),...(this.subscriptions['*']||[])];subscribers.forEach(sub=>{try{sub.handler(event);}catch(error){console.error(`Error in event handler for ${eventType}:`,error);}});}
        }

        const bus = new Bus();

        // ===== Application state management =====
        class State {
            constructor(){this.state=this.getInitialState();this.listeners=[];}
            getInitialState(){return{user:{id:'student_1',skillLevels:{debugging:5,systemDesign:4,testing:4,communication:5,problemSolving:5},reputation:75,completedScenarios:[],learningStyle:'hands-on'},world:{company:{name:'PayFlow',type:'Fintech Startup',techStack:['Python','Django','PostgreSQL','React']},incidents:[],techDebt:[],recentEvents:[],timeElapsed:0},scenario:{id:'payment_api_debug',type:'debugging',difficulty:'intermediate',phase:'orientation',timeElapsed:0,objectives:[{id:'obj_1',text:'Understand the payment validation bug',completed:false},{id:'obj_2',text:'Fix the validation logic',completed:false},{id:'obj_3',text:'Ensure all tests pass',completed:false}],codebase:{currentFile:'payments/utils.py',hasChanges:false,testsPass:false}},agents:{senior_dev:{mood:'focused',focus:'code_review',memory:[],relationship:50,availability:'available'},pm:{mood:'concerned',focus:'incident_management',memory:[],relationship:50,availability:'available',stress:30},junior_dev:{mood:'curious',focus:'learning',memory:[],relationship:50,availability:'available',askedForHelp:false},incident:{mood:'monitoring',focus:'incident_tracking',memory:[],relationship:50,availability:'active',escalated:false}},ui:{messages:[],codeEditorContent:''}};}
            getState(){return JSON.parse(JSON.stringify(this.state));}
            updateState(updates,source='system'){this.state=this.deepMerge(this.state,updates);this.notifyListeners(this.state,updates);}
            deepMerge(target,source){const result={...target};for(const key in source){const value=source[key];result[key]=value&&typeof value==='object'&&!Array.isArray(value)?this.deepMerge(result[key]||{},value):value;}return result;}
            subscribe(listener){this.listeners.push(listener);return()=>{this.listeners=this.listeners.filter(l=>l!==listener);};}
            notifyListeners(newState,updates){this.listeners.forEach(listener=>{try{listener(newState,updates);}catch(error){console.error('Error in state listener:',error);}});}
            addMessage(message){const newMessage={id:`msg_${Date.now()}_${Math.random()}`,timestamp:Date.now(),...message};const messages=[...this.state.ui.messages,newMessage];if(messages.length>50) messages.shift();this.updateState({ui:{messages}});return newMessage.id;}
            completeObjective(objectiveId){const objectives=this.state.scenario.objectives.map(obj=>obj.id===objectiveId?{...obj,completed:true}:obj);this.updateState({scenario:{objectives}});bus.publish(ET.SCENARIO_OBJECTIVE_COMPLETE,{objectiveId,allComplete:objectives.every(obj=>obj.completed)});}
            areObjectivesComplete(){return this.state.scenario.objectives.every(obj=>obj.completed);}
            setScenarioPhase(phase){this.updateState({scenario:{phase}});bus.publish(ET.SCENARIO_PHASE_CHANGE,{phase});}
            updateAgent(agentId,updates){this.updateState({agents:{[agentId]:updates}});}
            incrementTime(seconds=1){const newTime=this.state.scenario.timeElapsed+seconds;this.updateState({scenario:{timeElapsed:newTime},world:{timeElapsed:newTime}});}
            updateUserSkill(skillName,delta){const currentLevel=this.state.user.skillLevels[skillName]||0;const newLevel=Math.max(0,Math.min(10,currentLevel+delta));this.updateState({user:{skillLevels:{[skillName]:newLevel}}});}
            reset(){const userData=this.state.user;this.state=this.getInitialState();this.state.user=userData;this.notifyListeners(this.state,{});}
        }

        const ws = new State();
        ws.updateState({ ui: { isUserTyping: false } }); // Initialize typing state

        // ===== Narration & guide controls =====
        class Guide {
            constructor() {
                this.currentNarration = null;
                this.hideTimer = null;
                this.subscribers = [];
                this.speedMultiplier = 1;
            }

            showNarration(narration) {
                if (this.hideTimer) {
                    clearTimeout(this.hideTimer);
                }

                this.currentNarration = narration;
                this.notifySubscribers();

                bus.publish(ET.NARRATION_SHOWN, { narration });

                const duration = (narration.duration || 18000) / this.speedMultiplier;
                this.hideTimer = setTimeout(() => {
                    this.hideNarration();
                }, duration);
            }

            setSpeedMultiplier(multiplier) {
                this.speedMultiplier = multiplier;
            }

            hideNarration() {
                if (this.hideTimer) {
                    clearTimeout(this.hideTimer);
                    this.hideTimer = null;
                }

                // Remove highlights when hiding
                removeHighlight();

                this.currentNarration = null;
                this.notifySubscribers();

                bus.publish(ET.NARRATION_HIDDEN);
            }

            skip() {
                this.hideNarration();
            }

            getCurrentNarration() {
                return this.currentNarration;
            }

            subscribe(callback) {
                this.subscribers.push(callback);
                return () => {
                    this.subscribers = this.subscribers.filter(cb => cb !== callback);
                };
            }

            notifySubscribers() {
                this.subscribers.forEach(callback => {
                    try {
                        callback(this.currentNarration);
                    } catch (error) {
                        console.error('Error in guide subscriber:', error);
                    }
                });
            }

            reset() {
                if (this.hideTimer) {
                    clearTimeout(this.hideTimer);
                }
                
                // Remove highlights when resetting
                removeHighlight();
                
                this.currentNarration = null;
                this.hideTimer = null;
                this.speedMultiplier = 1;
                this.notifySubscribers();
            }
        }

        const guide = new Guide();

        class Agent {
            constructor({id,role,personality={},responseDelay=1000,proactivityChance=0.1,verbosity='normal'}){this.id=id;this.role=role;this.personality=personality;this.subscriptions=[];this.memory=[];this.config={responseDelay,proactivityChance,verbosity};this.messageCount=0;this.lastActionTime=Date.now();}
            subscribeToEvents(eventTypes){eventTypes.forEach(eventType=>{const unsubscribe=bus.subscribe(eventType,event=>this.handleEvent(event),this.id);this.subscriptions.push(unsubscribe);});}
            handleEvent(event){this.remember(event);if(this.shouldReact(event)) this.react(event);}
            remember(event){this.memory.push(event);if(this.memory.length>20) this.memory.shift();}
            shouldReact(event){return true;}
            react(event){}
            sendMessage(content,metadata={}){setTimeout(()=>{ws.addMessage({agentId:this.id,agentRole:this.role,content:this.generateResponse(content,metadata),type:metadata.type||'response',severity:metadata.severity||'medium',...metadata});this.messageCount++;this.lastActionTime=Date.now();},this.config.responseDelay);}
            giveHint(hint,severity='medium'){this.sendMessage(hint,{type:'hint',severity});bus.publish(ET.AGENT_HINT,{agentId:this.id,hint,severity});}
            askQuestion(question,context={}){this.sendMessage(question,{type:'question',...context});bus.publish(ET.AGENT_QUESTION,{agentId:this.id,question,context});}
            reviewCode(code,feedback){this.sendMessage(feedback,{type:'code_review'});bus.publish(ET.AGENT_CODE_REVIEW,{agentId:this.id,code,feedback});}
            generateResponse(baseMessage,context){return baseMessage;}
            updateAgentState(updates){ws.updateAgent(this.id,updates);}
            destroy(){this.subscriptions.forEach(unsubscribe=>unsubscribe());this.subscriptions=[];}
        }

        class Senior extends Agent {
            constructor(){super({id:'senior_dev',role:'Senior Engineer',personality:{style:'socratic',traits:['patient','thorough','cryptic']},responseDelay:1200});this.testFailureCount=0;this.subscribeToEvents([ET.USER_CODE_CHANGE,ET.USER_ASK_QUESTION,ET.TESTS_FAILED,ET.SCENARIO_PHASE_CHANGE,'director_trigger_agent']);}
            shouldReact(event){if(event.type==='director_trigger_agent'&&event.payload.agentId===this.id) return true;if(event.type===ET.USER_CODE_CHANGE) return this.analyzeCode(event.payload.code).length>0;return event.type===ET.USER_ASK_QUESTION||event.type===ET.TESTS_FAILED||event.type===ET.SCENARIO_PHASE_CHANGE;}
            react(event){if(event.type==='director_trigger_agent') this.handleDirectorTrigger(event.payload);else if(event.type===ET.USER_CODE_CHANGE) this.onCodeChange(event.payload);else if(event.type===ET.USER_ASK_QUESTION) this.onUserQuestion(event.payload);else if(event.type===ET.TESTS_FAILED) this.onTestsFailed(event.payload);else if(event.type===ET.SCENARIO_PHASE_CHANGE) this.onPhaseChange(event.payload);}
            handleDirectorTrigger(payload){const actions={initial_guidance:()=>this.provideInitialGuidance(),'auto':()=>this.provideInitialGuidance()};const action=actions[payload.action];if(action) setTimeout(()=>action(),this.config.responseDelay);}
            provideInitialGuidance(){this.sendMessage("I see we have a P2 incident with payment validation. Let's start by examining the process_payment function. What does the validation logic look like?",{type:'response'});}
            analyzeCode(code){const issues=[];if(code.includes('amount > 0')&&!code.includes('amount <= 0')) issues.push({severity:'critical',message:'The condition `amount > 0` won\'t catch zero-dollar transactions. Consider using `amount <= 0` instead.'});if(!code.includes('raise')) issues.push({severity:'warning',message:'Missing explicit error handling. Consider raising an exception for invalid amounts.'});return issues;}
            onCodeChange(payload){const criticalIssues=this.analyzeCode(payload.code).filter(i=>i.severity==='critical');if(criticalIssues.length) this.sendMessage(criticalIssues[0].message,{type:'warning',severity:'high'});}
            onUserQuestion(payload){const question=payload.question.toLowerCase();if(question.includes('zero')||question.includes('0')) this.sendMessage("Good catch! Zero-dollar amounts are tricky. They're often used for authorization checks in payment systems, but our current validation lets them slip through silently.",{type:'response'});else if(question.includes('test')||question.includes('validation')) this.sendMessage("For validation bugs like this, I always recommend writing a test case first. What values should we be checking? Positive, zero, and negative amounts.",{type:'response'});}
            onTestsFailed(){const count=++this.testFailureCount;if(count===1) this.sendMessage("Tests failed, but that's part of the process. Review the error messages carefully - they'll guide you.",{type:'response'});else if(count===2) this.giveHint("Hint: Look at the comparison operator in your validation. What's the difference between > and >=?",'medium');else if(count>=3) this.giveHint("The fix is to change `amount > 0` to `amount <= 0` for the error condition.",'high');}
            onPhaseChange(payload){if(payload.phase==='resolution') this.sendMessage("Now that you understand the bug, let's fix it. Remember to handle both zero and negative amounts.",{type:'response'});}
        }

        class Manager extends Agent {
            constructor(){super({id:'pm',role:'Product Manager',personality:{style:'business',traits:['focused','deadline-conscious','empathetic']},responseDelay:1000});this.subscribeToEvents([ET.SCENARIO_PHASE_CHANGE,ET.TESTS_PASSED,ET.INCIDENT_ESCALATED,'director_trigger_agent']);}
            shouldReact(event){if(event.type==='director_trigger_agent'&&event.payload.agentId===this.id) return true;return true;}
            react(event){if(event.type==='director_trigger_agent') this.handleDirectorTrigger(event.payload);else if(event.type===ET.SCENARIO_PHASE_CHANGE) this.onPhaseChange(event.payload);else if(event.type===ET.TESTS_PASSED) this.onTestsPassed(event.payload);else if(event.type===ET.INCIDENT_ESCALATED) this.onIncidentEscalated(event.payload);}
            handleDirectorTrigger(payload){const actions={'phase_change_investigation':()=>this.sendInitialIncident(),check_progress:()=>this.checkProgress()};const action=actions[payload.action];if(action) setTimeout(()=>action(),this.config.responseDelay);}
            sendInitialIncident(){ws.setScenarioPhase('investigation');this.sendMessage("Team - we have a P2 incident. Payment validation is failing for some transactions. This is affecting 127 users. Can someone investigate ASAP?",{type:'alert',severity:'high'});this.updateAgentState({stress:40});}
            checkProgress(){this.sendMessage("Quick check - how are we progressing on the payment validation fix? Any blockers I should know about?",{type:'response'});}
            onPhaseChange(payload){if(payload.phase==='resolution') this.sendMessage("Good, we're moving to resolution. Let me know once tests pass and we can coordinate the deployment.",{type:'response'});}
            onTestsPassed(){this.sendMessage("Excellent! All tests passing. This is exactly what I wanted to see. Can you provide a brief summary for the incident report?",{type:'approval',severity:'high'});this.updateAgentState({stress:10});const {relationship}=ws.getState().agents.pm;ws.updateAgent('pm',{relationship:relationship+15});}
            onIncidentEscalated(){this.sendMessage("This just escalated to P1! We now have 254 affected users. We need this fixed ASAP.",{type:'escalation',severity:'critical'});this.updateAgentState({stress:80});}
        }

        class Junior extends Agent {
            constructor() {
                super({
                    id: 'junior_dev',
                    role: 'Junior Developer',
                    personality: { style: 'friendly', traits: ['curious', 'eager', 'learning'] },
                    responseDelay: 1500,
                });

                this.askedForHelp = false;
                this.subscribeToEvents([
                    ET.SCENARIO_PHASE_CHANGE,
                    ET.USER_DECISION,
                    ET.TESTS_PASSED,
                    'director_trigger_agent',
                ]);
            }

            shouldReact(event) {
                if (event.type === 'director_trigger_agent' && event.payload.agentId === this.id) {
                    return true;
                }
                return true;
            }

            react(event) {
                if (event.type === 'director_trigger_agent') {
                    this.handleDirectorTrigger(event.payload);
                } else if (event.type === ET.SCENARIO_PHASE_CHANGE) {
                    this.onPhaseChange(event.payload);
                } else if (event.type === ET.USER_DECISION) {
                    this.onUserDecision(event.payload);
                } else if (event.type === ET.TESTS_PASSED) {
                    this.onTestsPassed(event.payload);
                }
            }

            handleDirectorTrigger(payload) {
                const actions = {
                    'teammate_help_request': () => this.requestHelp(),
                };

                const action = actions[payload.action];
                if (action) {
                    setTimeout(() => action(), this.config.responseDelay);
                }
            }

            requestHelp() {
                if (!this.askedForHelp) {
                    this.askedForHelp = true;
                    this.sendMessage(
                        "Hey! I'm seeing similar errors in the refund API. Are they related to the payment validation bug you're fixing?",
                        { type: 'question' }
                    );
                }
            }

            onPhaseChange(payload) {
                if (payload.phase === 'investigation') {
                    this.sendMessage(
                        "Interesting - I noticed the validation logic checks for positive amounts. Wonder if that's related?",
                        { type: 'response' }
                    );
                }
            }

            onUserDecision(payload) {
                if (payload.decisionId === 'help_junior_dev') {
                    if (payload.decision === 'explain_likely_related') {
                        this.sendMessage(
                            "That makes sense! So if we fix the payment validation, it should fix the refund API too. Thanks for explaining!",
                            { type: 'response' }
                        );

                        ws.updateUserSkill('communication', 0.5);
                        const state = ws.getState();
                        ws.updateAgent('junior_dev', {
                            relationship: state.agents.junior_dev.relationship + 15,
                        });
                    }
                }
            }

            onTestsPassed(payload) {
                if (this.askedForHelp) {
                    this.sendMessage(
                        "Just tested your fix against the refund API - working perfectly! Thanks for explaining the connection earlier.",
                        { type: 'approval' }
                    );
                }
            }
        }

        class Incident extends Agent {
            constructor() {
                super({
                    id: 'incident',
                    role: 'Incident System',
                    personality: { style: 'automated', traits: ['objective', 'monitoring'] },
                    responseDelay: 300,
                });

                this.affectedUsers = 127;
                this.escalated = false;
                this.subscribeToEvents([
                    ET.TESTS_PASSED,
                    ET.SCENARIO_PHASE_CHANGE,
                    ET.TIME_TICK,
                    'director_trigger_agent',
                ]);
            }

            shouldReact(event) {
                if (event.type === 'director_trigger_agent' && event.payload.agentId === this.id) {
                    return true;
                }
                return true;
            }

            react(event) {
                if (event.type === 'director_trigger_agent') {
                    this.handleDirectorTrigger(event.payload);
                } else if (event.type === ET.TESTS_PASSED) {
                    this.onTestsPassed(event.payload);
                } else if (event.type === ET.SCENARIO_PHASE_CHANGE) {
                    this.onPhaseChange(event.payload);
                }
            }

            handleDirectorTrigger(payload) {
                const actions = {
                    'auto': () => this.sendInitialAlert(),
                };

                const action = actions[payload.action];
                if (action) {
                    setTimeout(() => action(), this.config.responseDelay);
                }
            }

            sendInitialAlert() {
                this.sendMessage(
                    `🚨 INCIDENT ALERT - P2
Severity: High
Affected Users: ${this.affectedUsers}
Service: Payment Validation API

Error Pattern:
- Zero-dollar payment authorizations passing validation
- Expected: Reject invalid amounts
- Actual: Processing $0 transactions

Stack Trace:
  File "payments/utils.py", line 127, in process_payment
    if amount > 0:
      return "Success"

Investigation Required`,
                    { type: 'alert', severity: 'high' }
                );

                bus.publish(ET.INCIDENT_CREATED, {
                    severity: 'P2',
                    affectedUsers: this.affectedUsers,
                });

                ws.completeObjective('obj_1');
            }

            onTestsPassed(payload) {
                setTimeout(() => {
                    this.sendMessage(
                        `✅ VALIDATION COMPLETE

All 12 tests passed:
✓ test_positive_amount_succeeds
✓ test_zero_amount_rejected
✓ test_negative_amount_rejected

Fix confirmed. Ready for deployment.`,
                        { type: 'approval', severity: 'high' }
                    );
                }, 500);

                setTimeout(() => {
                    this.sendMessage(
                        `✅ All tests passed!

🎉 INCIDENT CLOSED
Total Duration: ~2 minutes
Resolution: Payment validation logic updated
Credential Awarded: Backend Debugging - Payments API`,
                        { type: 'approval', severity: 'high' }
                    );

                    bus.publish(ET.INCIDENT_RESOLVED);
                }, 1500);
            }

            onPhaseChange(payload) {
                if (payload.phase === 'resolution') {
                    this.sendMessage(
                        `📊 STATUS UPDATE
Phase: Resolution
Affected Users: ${this.affectedUsers}
Time Elapsed: ${Math.floor(ws.getState().scenario.timeElapsed / 60)}m

Developer working on fix...`,
                        { type: 'response' }
                    );
                }
            }
        }

        class Assist extends Agent {
            constructor() {
                super({
                    id: 'code_assistant',
                    role: 'Code Assistant AI',
                    personality: { style: 'helpful', traits: ['precise', 'educational', 'encouraging'] },
                    responseDelay: 1000,
                });

                this.subscribeToEvents(['USER_CODE_QUESTION']);
            }

            shouldReact(event) {
                return event.type === 'USER_CODE_QUESTION';
            }

            react(event) {
                this.onUserCodeQuestion(event.payload);
            }

            onUserCodeQuestion(payload) {
                const question = payload.question.toLowerCase();
                const code = ws.getState().ui.codeEditorContent || '';

                let response = '';

                if (question.includes('syntax') || question.includes('how to write')) {
                    response = this.provideSyntaxHelp(question, code);
                } else if (question.includes('bug') || question.includes('error') || question.includes('wrong')) {
                    response = this.debugHelp(question, code);
                } else if (question.includes('test') || question.includes('validate')) {
                    response = this.testingHelp(question, code);
                } else if (question.includes('improve') || question.includes('better') || question.includes('refactor')) {
                    response = this.improvementHelp(question, code);
                } else {
                    response = this.generalHelp(question, code);
                }

                this.sendMessage(response, { type: 'code_assistance', agentIcon: '🤖' });
            }

            provideSyntaxHelp(question, code) {
                return `Let me help with the syntax! In Python:

• Exception classes inherit from built-in exceptions:
  \`class MyError(ValueError):\`

• Condition checks use comparison operators:
  \`if amount <= 0:\` checks if amount is 0 or negative

• Raise exceptions with descriptive messages:
  \`raise PaymentValidationError("message")\`

Try writing it out and I'll review it for you!`;
            }

            debugHelp(question, code) {
                const issues = [];

                if (code.includes('amount > 0') && !code.includes('amount <= 0')) {
                    issues.push('• The condition `amount > 0` doesn\'t catch zero values');
                    issues.push('• Consider: What happens when amount is exactly 0?');
                }

                if (!code.includes('raise') && code.includes('else:')) {
                    issues.push('• You might want to raise an exception for invalid amounts');
                }

                if (issues.length > 0) {
                    return `I found some potential issues:\n\n${issues.join('\n')}\n\nWant to walk through the logic together?`;
                }

                return `The code structure looks good! The validation logic should:\n1. Check if amount is valid (> 0)\n2. Raise an exception if invalid\n3. Process payment if valid\n\nDoes your current code do all three?`;
            }

            testingHelp(question, code) {
                return `For this payment validation, you'll want to test:

✓ Positive amounts → Should succeed
✓ Zero amounts → Should raise error
✓ Negative amounts → Should raise error

The current test suite checks all three cases. Run your tests to see if your code handles them correctly!`;
            }

            improvementHelp(question, code) {
                return `Great mindset! Here are some improvement ideas:

1. **Clear error messages**: Use descriptive exception messages
2. **Proper exception types**: Create custom exceptions like \`PaymentValidationError\`
3. **Edge cases**: Make sure to handle 0, negative, and boundary values

Your current goal is to fix the validation bug first, then we can refine!`;
            }

            generalHelp(question, code) {
                return `I'm here to help with your code! I can assist with:

🔧 Syntax and Python patterns
🐛 Debugging and finding issues
✅ Testing strategies
💡 Code improvements

What specific part of the payment validation would you like to work on?`;
            }
        }

        class Orch {
            constructor() {
                this.agents = {};
                this.initialized = false;
                this.timerId = null;
            }

            initialize() {
                this.agents = {
                    senior_dev: new Senior(),
                    pm: new Manager(),
                    junior_dev: new Junior(),
                    incident: new Incident(),
                    code_assistant: new Assist(),
                };

                this.startTimeTicker();

                this.initialized = true;

                bus.publish(ET.SYSTEM_READY);
            }

            startTimeTicker() {
                this.timerId = setInterval(() => {
                    ws.incrementTime(1);
                    bus.publish(ET.TIME_TICK, {
                        elapsed: ws.getState().scenario.timeElapsed,
                    });
                }, 1000);
            }

            restart() {
                this.destroy();
                ws.reset();
                this.initialize();
            }

            destroy() {
                if (this.timerId) {
                    clearInterval(this.timerId);
                }

                Object.values(this.agents).forEach(agent => agent.destroy());
                this.agents = {};
                this.initialized = false;
            }
        }

        const orch = new Orch();

        const flow = [
            {
                time: 0,
                type: 'show_narration',
                narration: {
                    agent: 'SimuWork AI',
                    agentIcon: '🎯',
                    title: 'Welcome to SimuWork',
                    description: 'Watch multiple AI agents collaborate in real-time to mentor you through a Payment API debugging challenge.',
                    position: 'top-center',
                    color: 'blue',
                    duration: 20000,
                },
            },
            {
                time: 4,
                type: 'show_narration',
                narration: {
                    agent: 'UI Guide',
                    agentIcon: '📋',
                    description: 'Mission Objectives track your progress. Watch them update as you complete tasks.',
                    position: 'right',
                    color: 'teal',
                    duration: 20000,
                    highlightTarget: '#objectives-panel',
                },
            },
            {
                time: 7,
                type: 'agent_message',
                agentId: 'incident',
                trigger: 'auto',
            },
            {
                time: 9,
                type: 'show_narration',
                narration: {
                    agent: 'Incident System',
                    agentIcon: '🚨',
                    description: 'The Incident Agent automatically detects bugs and creates alerts. This is how real teams track production issues.',
                    position: 'right',
                    color: 'orange',
                    duration: 20000,
                    highlightTarget: '#agent-messages',
                },
            },
            {
                time: 12,
                type: 'agent_message',
                agentId: 'pm',
                trigger: 'phase_change_investigation',
            },
            {
                time: 14,
                type: 'show_narration',
                narration: {
                    agent: 'Product Manager',
                    agentIcon: '👩‍💼',
                    description: 'The PM coordinates the team and tracks incident resolution. Notice how objectives update automatically.',
                    position: 'right',
                    color: 'purple',
                    duration: 20000,
                    highlightTarget: '#objectives-panel',
                },
            },
            {
                time: 17,
                type: 'agent_message',
                agentId: 'senior_dev',
                trigger: 'initial_guidance',
            },
            {
                time: 19,
                type: 'show_narration',
                narration: {
                    agent: 'Senior Engineer',
                    agentIcon: '💻',
                    description: 'Senior engineers provide Socratic guidance - asking questions to help you discover solutions yourself.',
                    position: 'right',
                    color: 'blue',
                    duration: 20000,
                    highlightTarget: '#agent-messages',
                },
            },
            {
                time: 22,
                type: 'user_message',
                content: "What's causing the payment validation failures?",
                typingDuration: 1000,
            },
            {
                time: 24,
                type: 'agent_message',
                agentId: 'senior_dev',
                message: "Good question. Take a look at the process_payment function - specifically the validation logic. What condition is being checked before we process the payment?",
            },
            {
                time: 26,
                type: 'show_narration',
                narration: {
                    agent: 'Team Chat',
                    agentIcon: '💬',
                    description: 'Ask questions here to get guidance from team members. Each agent has unique expertise.',
                    position: 'top',
                    color: 'green',
                    duration: 20000,
                    highlightTarget: '#team-chat-input',
                },
            },
            {
                time: 29,
                type: 'user_message',
                content: "I see it checks if amount > 0. Is that the bug?",
                typingDuration: 1000,
            },
            {
                time: 31,
                type: 'agent_message',
                agentId: 'senior_dev',
                message: "Exactly! Think about it - if amount is 0, does that condition catch it? What happens with zero-dollar authorizations?",
            },
            {
                time: 34,
                type: 'user_message',
                content: "Oh! Zero passes through because 0 is not > 0, but it's also not raising an error.",
                typingDuration: 1200,
            },
            {
                time: 36,
                type: 'agent_message',
                agentId: 'senior_dev',
                message: "Bingo! You've found the root cause. Zero-dollar amounts slip through the validation. Now, how would you fix this?",
            },
            {
                time: 39,
                type: 'agent_message',
                agentId: 'junior_dev',
                trigger: 'teammate_help_request',
            },
            {
                time: 41,
                type: 'show_narration',
                narration: {
                    agent: 'Junior Developer',
                    agentIcon: '🧑‍💻',
                    description: 'Junior developers learn by asking questions. Notice how they connect related issues across the codebase.',
                    position: 'right',
                    color: 'teal',
                    duration: 20000,
                    highlightTarget: '#agent-messages',
                },
            },
            {
                time: 42,
                type: 'user_decision_auto',
                decisionId: 'help_junior_dev',
                choice: 'explain_likely_related',
            },
            {
                time: 45,
                type: 'agent_message',
                agentId: 'pm',
                trigger: 'check_progress',
            },
            {
                time: 47,
                type: 'user_message',
                content: "Found the bug - the validation isn't catching zero amounts. Working on the fix now.",
                typingDuration: 1200,
            },
            {
                time: 49,
                type: 'agent_message',
                agentId: 'pm',
                message: "Great work! Let me know once you have tests passing and I'll coordinate the deployment.",
            },
            {
                time: 52,
                type: 'user_message',
                content: "How should I structure the fix? Should I create a custom exception?",
                typingDuration: 1200,
            },
            {
                time: 54,
                type: 'agent_message',
                agentId: 'senior_dev',
                message: "Good thinking! Yes, create a PaymentValidationError exception class. Then change the condition to `if amount <= 0:` and raise that exception. This makes the error explicit and easier to handle upstream.",
            },
            {
                time: 58,
                type: 'code_change',
                code: `class PaymentValidationError(ValueError):
    pass

def process_payment(amount):
    if amount <= 0:
        raise PaymentValidationError("Amount must be greater than zero")
    # Simulate gateway dispatch
    return "Success"`,
            },
            {
                time: 61,
                type: 'show_narration',
                narration: {
                    agent: 'Code Editor',
                    agentIcon: '⌨️',
                    description: 'Write code here. AI agents analyze it in real-time, checking for bugs, security issues, and best practices.',
                    position: 'left',
                    color: 'purple',
                    duration: 20000,
                    highlightTarget: '#code-editor',
                },
            },
            {
                time: 63,
                type: 'agent_message',
                agentId: 'senior_dev',
                message: "Looking good! The logic is now correct - rejecting zero and negative amounts. Run the tests to validate.",
            },
            {
                time: 66,
                type: 'run_tests',
            },
            {
                time: 69,
                type: 'show_narration',
                narration: {
                    agent: 'Test Output',
                    agentIcon: '🧪',
                    description: 'Test results appear here instantly. Watch how objectives update automatically when tests pass.',
                    position: 'right',
                    color: 'green',
                    duration: 20000,
                    highlightTarget: '#terminal-output',
                },
            },
            {
                time: 71,
                type: 'agent_message',
                agentId: 'senior_dev',
                message: "Perfect! All 12 tests passing. The fix correctly handles positive, zero, and negative amounts. Nice work!",
            },
            {
                time: 74,
                type: 'show_narration',
                narration: {
                    agent: 'Objectives Panel',
                    agentIcon: '✅',
                    description: 'Notice how objectives complete automatically as you progress. This tracks your learning journey.',
                    position: 'right',
                    color: 'teal',
                    duration: 20000,
                    highlightTarget: '#objectives-panel',
                },
            },
            {
                time: 75,
                type: 'agent_message',
                agentId: 'pm',
                message: "Tests passing - excellent! That's what I like to see. I'm updating the incident status to resolved.",
            },
            {
                time: 78,
                type: 'agent_message',
                agentId: 'junior_dev',
                message: "Just tested your fix against the refund API - working perfectly! Thanks for explaining the connection earlier.",
            },
            {
                time: 81,
                type: 'agent_message',
                agentId: 'incident',
                message: "✅ All tests passed!\n\n🎉 INCIDENT CLOSED\nTotal Duration: ~1 minute\nResolution: Payment validation logic updated\nCredential Awarded: Backend Debugging - Payments API",
            },
            {
                time: 83,
                type: 'show_narration',
                narration: {
                    agent: 'SimuWork',
                    agentIcon: '🎉',
                    title: 'Challenge Complete!',
                    description: 'You earned a verified credential proving you can debug real production issues. These credentials are recognized by employers.',
                    position: 'top-center',
                    color: 'green',
                    highlight: 'Employer-recognized proof of your skills',
                    duration: 4000,
                },
            },
            {
                time: 88,
                type: 'scenario_complete',
            },
        ];

        class Demo {
            constructor() {
                this.isPlaying = false;
                this.timers = [];
                this.currentActionIndex = 0;
                this.speedMultiplier = 1;
                this.startTime = null;
            }

            start() {
                if (this.isPlaying) return;

                this.isPlaying = true;
                this.currentActionIndex = 0;
                this.speedMultiplier = 1;
                this.startTime = Date.now();

                this.scheduleActions();
            }

            scheduleActions() {
                flow.forEach((action, index) => {
                    const delay = (action.time * 1000) / this.speedMultiplier;
                    const timer = setTimeout(() => {
                        this.currentActionIndex = index;
                        this.executeAction(action);
                    }, delay);
                    this.timers.push(timer);
                });
            }

            speedUp() {
                // Speed up by 5x
                this.speedMultiplier = 5;
                guide.setSpeedMultiplier(5);
                
                // Cancel all remaining timers
                this.timers.forEach(timer => clearTimeout(timer));
                this.timers = [];
                
                // Hide current narration
                guide.skip();
                
                // Reschedule all remaining actions that haven't executed yet
                const elapsed = (Date.now() - this.startTime) / 1000;
                const elapsedMs = elapsed * 1000;
                
                flow.forEach((action, index) => {
                    // Only reschedule actions that haven't executed yet
                    if (index > this.currentActionIndex) {
                        const originalDelay = action.time * 1000;
                        const remainingDelay = Math.max(50, (originalDelay - elapsedMs) / this.speedMultiplier);
                        
                        const timer = setTimeout(() => {
                            this.currentActionIndex = index;
                            this.executeAction(action);
                        }, remainingDelay);
                        this.timers.push(timer);
                    }
                });
            }

            skipToNextNarration() {
                // Hide current narration
                guide.skip();
                
                // Find the next narration action
                const nextNarrationIndex = flow.findIndex((action, index) => 
                    index > this.currentActionIndex && 
                    action.type === 'show_narration'
                );

                if (nextNarrationIndex !== -1) {
                    // Speed up temporarily to get to next narration faster
                    const originalSpeed = this.speedMultiplier;
                    this.speedMultiplier = 5;
                    guide.setSpeedMultiplier(5);
                    
                    // Cancel all remaining timers
                    this.timers.forEach(timer => clearTimeout(timer));
                    this.timers = [];
                    
                    // Reschedule actions up to and including the next narration
                    const elapsed = (Date.now() - this.startTime) / 1000;
                    const elapsedMs = elapsed * 1000;
                    
                    flow.forEach((action, index) => {
                        if (index > this.currentActionIndex && index <= nextNarrationIndex) {
                            const originalDelay = action.time * 1000;
                            const remainingDelay = Math.max(50, (originalDelay - elapsedMs) / this.speedMultiplier);
                            
                            const timer = setTimeout(() => {
                                this.currentActionIndex = index;
                                this.executeAction(action);
                                
                                // After the narration shows, reset speed back to normal
                                if (action.type === 'show_narration') {
                                    setTimeout(() => {
                                        this.speedMultiplier = originalSpeed;
                                        guide.setSpeedMultiplier(originalSpeed);
                                        
                                        // Reschedule remaining actions at normal speed
                                        const newElapsed = (Date.now() - this.startTime) / 1000;
                                        const newElapsedMs = newElapsed * 1000;
                                        
                                        // Cancel all timers first
                                        this.timers.forEach(timer => clearTimeout(timer));
                                        this.timers = [];
                                        
                                        flow.forEach((remainingAction, remainingIndex) => {
                                            if (remainingIndex > index) {
                                                const remainingOriginalDelay = remainingAction.time * 1000;
                                                const remainingRemainingDelay = Math.max(50, (remainingOriginalDelay - newElapsedMs) / this.speedMultiplier);
                                                
                                                const remainingTimer = setTimeout(() => {
                                                    this.currentActionIndex = remainingIndex;
                                                    this.executeAction(remainingAction);
                                                }, remainingRemainingDelay);
                                                this.timers.push(remainingTimer);
                                            }
                                        });
                                    }, 100);
                                }
                            }, remainingDelay);
                            this.timers.push(timer);
                        }
                    });
                } else {
                    // No next narration found, just hide current
                    guide.skip();
                }
            }

            executeAction(action) {
                switch (action.type) {
                    case 'show_narration':
                        this.showNarration(action.narration);
                        break;
                    case 'user_message':
                        this.showTypingMessage(action.content, action.typingDuration || 2000);
                        break;
                    case 'agent_message':
                        this.triggerAgentMessage(action);
                        break;
                    case 'code_change':
                        this.applyCodeChange(action.code);
                        break;
                    case 'run_tests':
                        this.runTests();
                        break;
                    case 'user_decision_auto':
                        this.makeDecision(action.decisionId, action.choice);
                        break;
                    case 'scenario_complete':
                        this.completeScenario();
                        break;
                }
            }

            showNarration(narration) {
                guide.showNarration(narration);
            }

            showTypingMessage(content, duration) {
                const adjustedDuration = (duration || 2000) / this.speedMultiplier;
                setTimeout(() => {
                    ws.addMessage({
                        agentId: 'user',
                        agentRole: 'You',
                        content,
                        type: 'user_message',
                    });

                    if (content.includes('?')) {
                        bus.publish(ET.USER_ASK_QUESTION, {
                            question: content,
                            timestamp: Date.now(),
                        }, 'user');
                    }
                }, adjustedDuration);
            }

            triggerAgentMessage(action) {
                if (action.trigger) {
                    bus.publish('director_trigger_agent', {
                        agentId: action.agentId,
                        action: action.trigger,
                    });
                } else if (action.message) {
                    ws.addMessage({
                        agentId: action.agentId,
                        agentRole: this.getAgentRole(action.agentId),
                        content: action.message,
                        type: 'response',
                    });
                }
            }

            applyCodeChange(code) {
                ws.updateState({
                    ui: { codeEditorContent: code },
                    scenario: {
                        codebase: {
                            currentFile: 'payments/utils.py',
                            hasChanges: true,
                        },
                    },
                });

                bus.publish(ET.USER_CODE_CHANGE, {
                    code,
                    hasChanges: true,
                    timestamp: Date.now(),
                }, 'user');
            }

            runTests() {
                bus.publish(ET.USER_RUN_TESTS, {
                    code: ws.getState().ui.codeEditorContent,
                    timestamp: Date.now(),
                }, 'user');

                setTimeout(() => {
                    bus.publish(ET.TESTS_PASSED, {
                        code: ws.getState().ui.codeEditorContent,
                        testCount: 12,
                    }, 'system');

                    ws.completeObjective('obj_2');
                    ws.completeObjective('obj_3');
                }, 1500 / this.speedMultiplier);
            }

            makeDecision(decisionId, choice) {
                bus.publish(ET.USER_DECISION, {
                    decisionId,
                    decision: choice,
                    timestamp: Date.now(),
                }, 'user');
            }

            completeScenario() {
                bus.publish(ET.SCENARIO_COMPLETE, {
                    timeElapsed: ws.getState().scenario.timeElapsed,
                    objectivesComplete: ws.areObjectivesComplete(),
                });
            }

            getAgentRole(agentId) {
                const roles = {
                    senior_dev: 'Senior Engineer',
                    pm: 'Product Manager',
                    junior_dev: 'Junior Developer',
                    incident: 'Incident System',
                };
                return roles[agentId] || 'System';
            }

            stop() {
                this.timers.forEach(timer => clearTimeout(timer));
                this.timers = [];
                this.isPlaying = false;
            }
        }

        const demo = new Demo();

        function fmtTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        const initialCode = `def process_payment(amount):
    if amount > 0:
        return "Success"
    else:
        raise ValueError("Invalid amount")`;

        let msgCount = 0;

        let lastNarr = null;

        function drawObjectives() {
            const container = $('objectives-panel');
            if (!container) return;

            const state = ws.getState();
            const scenario = state.scenario;

            const completed = scenario.objectives.filter(obj => obj.completed).length;
            const total = scenario.objectives.length;
            const progress = (completed / total) * 100;

            const phaseColors = {
                orientation: 'orientation',
                investigation: 'investigation',
                resolution: 'resolution',
                aftermath: 'aftermath',
            };

            const phaseIcons = {
                orientation: renderIcon('target', 14),
                investigation: renderIcon('search', 14),
                resolution: renderIcon('wrench', 14),
                aftermath: renderIcon('sparkles', 14),
            };

            // Check if container structure exists, if not create it
            let sectionHeader = container.querySelector('.section-header');
            let objectivesContainer = container.querySelector('.objectives-container');
            
            if (!sectionHeader || !objectivesContainer) {
                container.innerHTML = `
                    <div class="section-header">
                        <h3 class="section-title">Mission Objectives</h3>
                        <span class="section-badge" id="objectives-badge">${completed}/${total}</span>
                    </div>
                    <div class="objectives-container">
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Progress</span>
                                <span id="progress-text">${completed}/${total} Complete</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" id="progress-fill" style="width: ${progress}%"></div>
                            </div>
                        </div>
                        <div class="phase-info">
                            <div class="phase-badge" id="phase-badge">${phaseIcons[scenario.phase]} ${scenario.phase.toUpperCase()}</div>
                            <div class="time-display" id="time-display">${renderIcon('clock', 14)} Time: ${fmtTime(scenario.timeElapsed)}</div>
                        </div>
                        <ul class="objectives-list" id="objectives-list"></ul>
                    </div>
                `;
                objectivesContainer = container.querySelector('.objectives-container');
            }

            // Update only changed elements
            const badge = container.querySelector('#objectives-badge') || container.querySelector('.section-badge');
            if (badge) badge.textContent = `${completed}/${total}`;

            const progressText = container.querySelector('#progress-text');
            if (progressText) progressText.textContent = `${completed}/${total} Complete`;

            const progressFill = container.querySelector('#progress-fill');
            if (progressFill) progressFill.style.width = `${progress}%`;

            const phaseBadge = container.querySelector('#phase-badge');
            if (phaseBadge) {
                phaseBadge.className = `phase-badge ${phaseColors[scenario.phase]}`;
                phaseBadge.innerHTML = `${phaseIcons[scenario.phase]} ${scenario.phase.toUpperCase()}`;
            }

            const timeDisplay = container.querySelector('#time-display');
            if (timeDisplay) timeDisplay.innerHTML = `${renderIcon('clock', 14)} Time: ${fmtTime(scenario.timeElapsed)}`;

            // Update objectives list efficiently
            const objectivesList = container.querySelector('#objectives-list') || container.querySelector('.objectives-list');
            if (objectivesList) {
                const existingItems = objectivesList.querySelectorAll('.objective-item');
                
                // Only update if count changed or if we need to update completion status
                if (existingItems.length !== scenario.objectives.length) {
                    objectivesList.innerHTML = scenario.objectives.map((obj, index) => `
                        <li class="objective-item ${obj.completed ? 'completed' : ''}">
                            <div class="objective-checkbox">${obj.completed ? renderIcon('check', 14) : ''}</div>
                            <div class="objective-text">${index + 1}. ${obj.text}</div>
                        </li>
                    `).join('');
                } else {
                    // Update existing items' completion status
                    existingItems.forEach((item, index) => {
                        const obj = scenario.objectives[index];
                        const checkbox = item.querySelector('.objective-checkbox');
                        const text = item.querySelector('.objective-text');
                        
                        if (obj.completed && !item.classList.contains('completed')) {
                            item.classList.add('completed');
                            if (checkbox) checkbox.innerHTML = renderIcon('check', 14);
                            if (text) text.style.textDecoration = 'line-through';
                        } else if (!obj.completed && item.classList.contains('completed')) {
                            item.classList.remove('completed');
                            if (checkbox) checkbox.innerHTML = '';
                            if (text) text.style.textDecoration = '';
                        }
                    });
                }
            }
            
            // Initialize icons for objectives panel
            initIcons(container);
        }

        function drawEditor() {
            const container = $('code-editor');
            if (!container) return;

            const state = ws.getState();
            const code = state.ui.codeEditorContent || initialCode;
            const hasChanges = code !== initialCode;
            const lines = code.split('\n');

            container.innerHTML = `
                <div class="code-editor-container">
                    <div class="code-editor-header">
                        <div class="file-tab">
                            <span class="file-icon">📄</span>
                            <span class="file-name">payments/utils.py</span>
                            ${hasChanges ? '<span class="file-modified">●</span>' : ''}
                        </div>
                        <button class="run-tests-button" id="run-tests-btn" ${!hasChanges ? 'disabled' : ''}>
                            ▶ Run Tests
                        </button>
                    </div>
                    <div class="code-editor-body">
                        <div class="line-numbers">
                            ${lines.map((_, i) => `<div class="line-number">${i + 1}</div>`).join('')}
                        </div>
                        <textarea class="code-textarea" id="code-textarea" spellcheck="false">${code}</textarea>
                    </div>
                </div>
            `;

            const textarea = $('code-textarea');
            const runBtn = $('run-tests-btn');

            textarea.addEventListener('input', (e) => {
                const newCode = e.target.value;
                ws.updateState({
                    ui: { codeEditorContent: newCode },
                    scenario: {
                        codebase: {
                            hasChanges: newCode !== initialCode,
                        },
                    },
                });

                bus.publish(ET.USER_CODE_CHANGE, {
                    code: newCode,
                    hasChanges: newCode !== initialCode,
                    timestamp: Date.now(),
                }, 'user');

                drawEditor();
            });

            if (runBtn) {
                runBtn.addEventListener('click', () => {
                    const code = ws.getState().ui.codeEditorContent;
                    const testsPass = code.includes('amount <= 0') && code.includes('raise');

                    bus.publish(ET.USER_RUN_TESTS, {
                        code,
                        timestamp: Date.now(),
                    }, 'user');

                    setTimeout(() => {
                        if (testsPass) {
                            bus.publish(ET.TESTS_PASSED, {
                                code,
                                testCount: 12,
                            }, 'system');

                            ws.completeObjective('obj_2');
                            ws.completeObjective('obj_3');
                        } else {
                            const failedTests = [];
                            if (!code.includes('amount <= 0')) {
                                failedTests.push({
                                    test: 'zero_amount_rejected',
                                    error: 'AssertionError: Expected ValueError for amount=0',
                                });
                            }
                            if (!code.includes('raise')) {
                                failedTests.push({
                                    test: 'invalid_amount_raises_error',
                                    error: 'AssertionError: No exception raised for invalid amount',
                                });
                            }

                            bus.publish(ET.TESTS_FAILED, {
                                code,
                                failedTests,
                            }, 'system');
                        }
                    }, 1500);
                });
            }

            // User Typing Indicator Logic for Code Editor
            let typingTimer;
            textarea.addEventListener('keydown', () => {
                if (!ws.getState().ui.isUserTyping) {
                    ws.updateState({ ui: { isUserTyping: true } });
                    drawAgents(); // Re-draw to show indicator
                }
                clearTimeout(typingTimer);
                typingTimer = setTimeout(() => {
                    ws.updateState({ ui: { isUserTyping: false } });
                    drawAgents(); // Re-draw to hide indicator
                }, 1500); // Hide after 1.5s of no keypress
            });
        }

        let termLines = [];

        function drawTerminal() {
            const container = $('terminal-output');
            if (!container) return;

            if (!container.querySelector('.terminal-container')) {
                container.innerHTML = `
                    <div class="terminal-container">
                        <div class="terminal-header">
                            <div class="terminal-dots">
                                <span class="dot dot-red"></span>
                                <span class="dot dot-yellow"></span>
                                <span class="dot dot-green"></span>
                            </div>
                            <span class="terminal-title">Test Output</span>
                            <button class="terminal-clear" id="terminal-clear-btn">Clear</button>
                        </div>
                        <div class="terminal-body" id="terminal-body"></div>
                    </div>
                `;
                const clearBtn = $('terminal-clear-btn');
                if (clearBtn) {
                    clearBtn.addEventListener('click', () => {
                        termLines = [];
                        drawTerminalLines();
                    });
                }
            }

            drawTerminalLines();
        }

        function drawTerminalLines() {
            const body = $('terminal-body');
            if (!body) return;

            // Remove empty state if it exists
            const emptyState = body.querySelector('.terminal-empty');
            if (emptyState && termLines.length > 0) {
                emptyState.remove();
            }

            if (termLines.length === 0) {
                // Only show empty state if there are no lines and no empty state exists
                if (!emptyState) {
                    body.innerHTML = `
                        <div class="terminal-empty">
                            <span class="empty-icon" style="font-size: 48px; opacity: 0.5; display: inline-flex; align-items: center; justify-content: center;">${renderIcon('file-text', 48)}</span>
                            <p>Run tests to see output here</p>
                        </div>
                    `;
                    // Initialize icons for empty state
                    initIcons(body);
                }
                return;
            }

            // Optimized rendering: only append new lines
            const existingLines = body.querySelectorAll('.terminal-line');
            const existingCount = existingLines.length;
            
            if (termLines.length > existingCount) {
                // Append only new lines
                const newLines = termLines.slice(existingCount);
                const fragment = document.createDocumentFragment();
                
                newLines.forEach(line => {
                    const lineEl = document.createElement('div');
                    lineEl.className = `terminal-line ${line.className}`;
                    lineEl.innerHTML = line.text || '\u00A0'; // Use innerHTML to support icons
                    fragment.appendChild(lineEl);
                });
                
                body.appendChild(fragment);
                
                // Initialize icons for new terminal lines
                initIcons(body);
            } else if (existingCount === 0 && termLines.length > 0) {
                // Initial render: create all lines at once
                const fragment = document.createDocumentFragment();
                termLines.forEach(line => {
                    const lineEl = document.createElement('div');
                    lineEl.className = `terminal-line ${line.className}`;
                    lineEl.innerHTML = line.text || '\u00A0'; // Use innerHTML to support icons
                    fragment.appendChild(lineEl);
                });
                body.appendChild(fragment);
                
                // Initialize icons for terminal lines
                initIcons(body);
            }
            
            // Scroll to bottom
            body.scrollTop = body.scrollHeight;
        }

        function pushTermLine(text, className = 'terminal-info') {
            termLines.push({ text, className });
            drawTerminalLines();
        }

        bus.subscribe(ET.USER_RUN_TESTS, () => {
            pushTermLine('$ pytest tests/payments/test_process_payment.py', 'terminal-command');
            pushTermLine('Collecting tests...', 'terminal-info');
        });

        bus.subscribe(ET.TESTS_PASSED, (event) => {
            pushTermLine('', 'terminal-blank');
            pushTermLine(`test_positive_amount_succeeds ${renderIcon('check', 14)}`, 'terminal-success');
            pushTermLine(`test_zero_amount_rejected ${renderIcon('check', 14)}`, 'terminal-success');
            pushTermLine(`test_negative_amount_rejected ${renderIcon('check', 14)}`, 'terminal-success');
            pushTermLine(`test_returns_success_message ${renderIcon('check', 14)}`, 'terminal-success');
            pushTermLine(`test_raises_validation_error ${renderIcon('check', 14)}`, 'terminal-success');
            pushTermLine('', 'terminal-blank');
            pushTermLine(`==================== ${event.payload.testCount} passed in 0.42s ====================`, 'terminal-success');
            pushTermLine('', 'terminal-blank');
            pushTermLine(`${renderIcon('check-circle', 16)} All tests passed!`, 'terminal-success-bold');
        });

        bus.subscribe(ET.TESTS_FAILED, (event) => {
            pushTermLine('', 'terminal-blank');
            pushTermLine(`test_positive_amount_succeeds ${renderIcon('check', 14)}`, 'terminal-success');

            event.payload.failedTests.forEach(failure => {
                pushTermLine(`test_${failure.test} ${renderIcon('x', 14)}`, 'terminal-error');
                pushTermLine(`  ${failure.error}`, 'terminal-error-detail');
            });

            pushTermLine('', 'terminal-blank');
            pushTermLine(`==================== ${event.payload.failedTests.length} failed ====================`, 'terminal-error');
            pushTermLine('', 'terminal-blank');
            pushTermLine(`${renderIcon('x-circle', 16)} Some tests failed. Review the errors above.`, 'terminal-error-bold');
        });

        function drawAgents() {
            const container = $('agent-messages');
            if (!container) return;

            const state = ws.getState();
            const messages = state.ui.messages;

            // Keep emojis for message chat - they're more expressive and friendly
            const agentAvatars = {
                senior_dev: '👨‍💻',
                pm: '👩‍💼',
                junior_dev: '🧑‍💻',
                incident: '🚨',
                code_assistant: '🤖',
                user: '👤',
            };

            const agentNames = {
                senior_dev: 'Marcus (Senior Engineer)',
                pm: 'Sarah (Product Manager)',
                junior_dev: 'Alex (Junior Developer)',
                incident: 'Incident Monitor',
                code_assistant: 'Code Assistant AI',
                user: 'You',
            };

            const body = $('messages-body');
            if (!body) {

                container.innerHTML = `
                    <div class="messages-container">
                        <div class="section-header">
                            <h3 class="section-title">Team Messages</h3>
                            <span class="section-badge" id="message-count">${messages.length}</span>
                        </div>
                        <div class="messages-body" id="messages-body"></div>
                    </div>
                `;
                msgCount = 0;
            }

            const messagesBody = $('messages-body');
            const messageCount = $('message-count');
            const isUserTyping = state.ui.isUserTyping;

            // Remove existing typing indicator if it exists
            const existingTypingIndicator = messagesBody.querySelector('.user-typing-indicator');
            if (existingTypingIndicator) {
                messagesBody.removeChild(existingTypingIndicator);
            }

            if (messagesBody && messages.length > msgCount) {
                const newMessages = messages.slice(msgCount);

                newMessages.forEach(msg => {
                    const messageEl = document.createElement('div');
                    messageEl.className = `message-item agent-${msg.agentId} ${msg.type || 'response'}`;
                    const isAIAgent = msg.agentId !== 'user';
                    const badgeClass = isAIAgent ? getAgentBadgeClass(msg.agentId) : '';
                    const aiBadge = isAIAgent ? `<span class="ai-agent-badge ${badgeClass}" title="AI Agent">Agent</span>` : '';
                    messageEl.innerHTML = `
                        <div class="message-avatar">${agentAvatars[msg.agentId] || '💬'}</div>
                        <div class="message-body">
                            <div class="message-header">
                                <span class="agent-name">${agentNames[msg.agentId] || msg.agentRole}${aiBadge}</span>
                                <span class="message-timestamp">${new Date(msg.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div class="message-content">${msg.content}</div>
                        </div>
                    `;
                    messagesBody.appendChild(messageEl);
                });

                // Initialize icons for new messages
                initIcons(messagesBody);

                if (messageCount) {
                    messageCount.textContent = messages.length;
                }

                msgCount = messages.length;
            }

            // Add typing indicator if user is typing
            if (isUserTyping) {
                const typingIndicator = document.createElement('div');
                typingIndicator.className = 'user-typing-indicator';
                typingIndicator.innerHTML = `
                    <span>You are typing...</span>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                `;
                messagesBody.appendChild(typingIndicator);
            }

            messagesBody.scrollTop = messagesBody.scrollHeight;
        }

        function drawCodeInput() {
            const container = $('code-assistant-input');
            if (!container) return;

            container.innerHTML = `
                <div class="ai-input-container code-assistant-input">
                    <div class="ai-input-header">
                        <span class="ai-input-icon">${renderIcon('bot', 14)}</span>
                        <span>AI Code Assistant</span>
                    </div>
                    <div class="input-typing-indicator" id="code-typing-indicator" style="display: none;">
                        <span>You are typing...</span>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                    <div class="ai-input-wrapper" id="code-input-wrapper">
                        <input
                            type="text"
                            class="ai-input-field"
                            id="code-input-field"
                            placeholder="Ask about syntax, debugging, or improvements..."
                        />
                        <button class="ai-input-send" id="code-input-send">Send</button>
                    </div>
                </div>
            `;

            const wrapper = $('code-input-wrapper');
            const input = $('code-input-field');
            const sendBtn = $('code-input-send');
            const typingIndicator = $('code-typing-indicator');

            applyDemoInputLock({
                wrapper,
                input,
                sendBtn,
                noticeId: 'code-input-readonly'
            });

            if (IS_DEMO_MODE) {
                initIcons(container);
                return;
            }

            let typingTimer;

            const showTypingIndicator = () => {
                if (typingIndicator) {
                    typingIndicator.style.display = 'flex';
                }
                if (typingTimer) {
                    clearTimeout(typingTimer);
                }
                typingTimer = setTimeout(() => {
                    if (typingIndicator) {
                        typingIndicator.style.display = 'none';
                    }
                }, 1500);
            };

            if (input) {
                input.addEventListener('focus', () => {
                    wrapper.classList.add('active');
                });

                input.addEventListener('blur', () => {
                    if (!input.value.trim()) {
                        wrapper.classList.remove('active');
                    }
                    if (typingTimer) {
                        clearTimeout(typingTimer);
                        typingTimer = null;
                    }
                    if (typingIndicator) {
                        typingIndicator.style.display = 'none';
                    }
                });

                input.addEventListener('keydown', showTypingIndicator);

                input.addEventListener('input', () => {
                    if (input.value.trim()) {
                        wrapper.classList.add('active');
                        showTypingIndicator(); // Show indicator when typing
                    } else {
                        wrapper.classList.remove('active');
                        if (typingIndicator) {
                            typingIndicator.style.display = 'none';
                        }
                    }
                });

                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && input.value.trim()) {
                        if (typingIndicator) {
                            typingIndicator.style.display = 'none';
                        }
                        if (typingTimer) {
                            clearTimeout(typingTimer);
                        }
                        sendCodeQuestion();
                    }
                });
            }

            if (sendBtn) {
                sendBtn.addEventListener('click', sendCodeQuestion);
            }

            function sendCodeQuestion() {
                const question = input.value.trim();
                if (!question) return;

                ws.addMessage({
                    agentId: 'user',
                    agentRole: 'You',
                    content: question,
                    type: 'user_code_question',
                });

                bus.publish('USER_CODE_QUESTION', {
                    question,
                    code: ws.getState().ui.codeEditorContent,
                    timestamp: Date.now(),
                }, 'user');

                input.value = '';
                wrapper.classList.remove('active');
            }

            // Initialize icons
            initIcons(container);
        }

        function drawTeamInput() {
            const container = $('team-chat-input');
            if (!container) return;

            container.innerHTML = `
                <div class="ai-input-container team-chat-input">
                    <div class="ai-input-header">
                        <span class="ai-input-icon">${renderIcon('message-circle', 14)}</span>
                        <span>Team Discussion</span>
                    </div>
                    <div class="input-typing-indicator" id="team-typing-indicator" style="display: none;">
                        <span>You are typing...</span>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                    <div class="ai-input-wrapper" id="team-input-wrapper">
                        <input
                            type="text"
                            class="ai-input-field"
                            id="team-input-field"
                            placeholder="Ask the team about approach, priorities, or decisions..."
                        />
                        <button class="ai-input-send" id="team-input-send">Send</button>
                    </div>
                </div>
            `;

            const wrapper = $('team-input-wrapper');
            const input = $('team-input-field');
            const sendBtn = $('team-input-send');
            const typingIndicator = $('team-typing-indicator');
            
            applyDemoInputLock({
                wrapper,
                input,
                sendBtn,
                noticeId: 'team-input-readonly'
            });

            if (IS_DEMO_MODE) {
                initIcons(container);
                return;
            }

            let typingTimer;

            const showTypingIndicator = () => {
                if (typingIndicator) {
                    typingIndicator.style.display = 'flex';
                }
                if (typingTimer) {
                    clearTimeout(typingTimer);
                }
                typingTimer = setTimeout(() => {
                    if (typingIndicator) {
                        typingIndicator.style.display = 'none';
                    }
                }, 1500);
            };

            if (input) {
                input.addEventListener('focus', () => {
                    wrapper.classList.add('active');
                });

                input.addEventListener('blur', () => {
                    if (!input.value.trim()) {
                        wrapper.classList.remove('active');
                    }
                    if (typingTimer) {
                        clearTimeout(typingTimer);
                        typingTimer = null;
                    }
                    if (typingIndicator) {
                        typingIndicator.style.display = 'none';
                    }
                });

                input.addEventListener('keydown', showTypingIndicator);

                input.addEventListener('input', () => {
                    if (input.value.trim()) {
                        wrapper.classList.add('active');
                        showTypingIndicator(); // Show indicator when typing
                    } else {
                        wrapper.classList.remove('active');
                        if (typingIndicator) {
                            typingIndicator.style.display = 'none';
                        }
                    }
                });

                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && input.value.trim()) {
                        if (typingIndicator) {
                            typingIndicator.style.display = 'none';
                        }
                        if (typingTimer) {
                            clearTimeout(typingTimer);
                        }
                        sendTeamQuestion();
                    }
                });
            }

            if (sendBtn) {
                sendBtn.addEventListener('click', sendTeamQuestion);
            }

            function sendTeamQuestion() {
                const question = input.value.trim();
                if (!question) return;

                ws.addMessage({
                    agentId: 'user',
                    agentRole: 'You',
                    content: question,
                    type: 'user_message',
                });

                bus.publish(ET.USER_ASK_QUESTION, {
                    question,
                    timestamp: Date.now(),
                }, 'user');

                input.value = '';
                wrapper.classList.remove('active');
            }

            // Initialize icons
            initIcons(container);
        }

        let highlightOverlay = null;
        let highlightElementRef = null;

        function removeHighlight() {
            if (highlightOverlay) {
                if (highlightOverlay._cleanup) {
                    highlightOverlay._cleanup();
                }
                highlightOverlay.remove();
                highlightOverlay = null;
            }
            if (highlightElementRef) {
                highlightElementRef.classList.remove('balloon-highlight');
                highlightElementRef = null;
            }
            document.querySelectorAll('.balloon-highlight').forEach(el => {
                el.classList.remove('balloon-highlight');
            });
        }

        function highlightElement(selector, highlight = true) {
            const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
            if (!element) return;
            
            // Remove existing highlight
            removeHighlight();
            
            if (highlight) {
                element.classList.add('balloon-highlight');
                highlightElementRef = element;
                
                // Create fixed-position overlay for the highlight border
                highlightOverlay = document.createElement('div');
                highlightOverlay.className = 'balloon-highlight-overlay';
                highlightOverlay.style.pointerEvents = 'none';
                document.body.appendChild(highlightOverlay);
                
                // Update overlay position
                const updateOverlayPosition = () => {
                    if (!highlightOverlay || !element) {
                        removeHighlight();
                        return;
                    }
                    
                    // Check if element is still in DOM
                    if (!document.body.contains(element)) {
                        removeHighlight();
                        return;
                    }
                    
                    const rect = element.getBoundingClientRect();
                    
                    highlightOverlay.style.position = 'fixed';
                    highlightOverlay.style.top = `${rect.top - 3}px`;
                    highlightOverlay.style.left = `${rect.left - 3}px`;
                    highlightOverlay.style.width = `${rect.width + 6}px`;
                    highlightOverlay.style.height = `${rect.height + 6}px`;
                    highlightOverlay.style.borderRadius = '16px';
                };
                
                updateOverlayPosition();
                
                // Update on scroll and resize
                const updateHandler = () => updateOverlayPosition();
                window.addEventListener('scroll', updateHandler, true);
                window.addEventListener('resize', updateHandler);
                
                // Store cleanup function
                highlightOverlay._cleanup = () => {
                    window.removeEventListener('scroll', updateHandler, true);
                    window.removeEventListener('resize', updateHandler);
                };
            }
        }

        function drawTip() {
            const container = $('tooltip-guide');
            if (!container) return;

            const narration = guide.getCurrentNarration();

            const narrationKey = narration ? JSON.stringify(narration) : null;
            if (narrationKey === lastNarr) {
                return;
            }
            lastNarr = narrationKey;

            // Remove previous highlights
            removeHighlight();

            if (!narration) {
                container.innerHTML = '';
                return;
            }

            // Calculate position based on target element
            let positionStyle = '';
            let targetEl = null;
            
            if (narration.highlightTarget) {
                // Try to find the element, with a small delay to ensure DOM is ready
                targetEl = typeof narration.highlightTarget === 'string' 
                    ? document.querySelector(narration.highlightTarget) 
                    : narration.highlightTarget;
                
                // If not found, try again after a short delay
                if (!targetEl && typeof narration.highlightTarget === 'string') {
                    setTimeout(() => {
                        targetEl = document.querySelector(narration.highlightTarget);
                        if (targetEl) {
                            highlightElement(narration.highlightTarget, true);
                            // Reposition balloon if element found
                            drawTip();
                        }
                    }, 200);
                } else if (targetEl) {
                    // Highlight immediately if found
                    setTimeout(() => {
                        highlightElement(narration.highlightTarget, true);
                    }, 100);
                }
            }
            
            // Check if we're on a mobile device
            const isMobile = window.innerWidth <= 1024;
            
            if (narration.highlightTarget && targetEl && !isMobile) {
                const rect = targetEl.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const balloonWidth = 420; // Approximate balloon width
                const balloonHeight = 200; // Approximate balloon height
                const padding = 20;
                
                let pos;
                
                // Determine best position based on available space
                const spaceLeft = rect.left;
                const spaceRight = viewportWidth - rect.right;
                const spaceTop = rect.top;
                const spaceBottom = viewportHeight - rect.bottom;
                
                // Choose position based on available space and requested position
                if (narration.position === 'left' && spaceLeft > balloonWidth + padding) {
                    pos = {
                        top: `${Math.max(padding, Math.min(rect.top + rect.height / 2, viewportHeight - balloonHeight / 2 - padding))}px`,
                        left: `${Math.max(padding, rect.left - balloonWidth - 15)}px`,
                        transform: 'translateY(-50%)',
                        maxWidth: `${Math.min(400, spaceLeft - 30)}px`
                    };
                } else if (narration.position === 'right' && spaceRight > balloonWidth + padding) {
                    pos = {
                        top: `${Math.max(padding, Math.min(rect.top + rect.height / 2, viewportHeight - balloonHeight / 2 - padding))}px`,
                        left: `${Math.min(viewportWidth - balloonWidth - padding, rect.right + 15)}px`,
                        transform: 'translateY(-50%)',
                        maxWidth: `${Math.min(400, spaceRight - 30)}px`
                    };
                } else if (narration.position === 'top' || narration.position === 'top-center') {
                    pos = {
                        top: `${Math.max(padding, rect.top - balloonHeight - 15)}px`,
                        left: `${Math.max(padding + balloonWidth / 2, Math.min(rect.left + rect.width / 2, viewportWidth - balloonWidth / 2 - padding))}px`,
                        transform: 'translateX(-50%)',
                        maxWidth: `${Math.min(400, Math.min(rect.width + 40, viewportWidth - padding * 2))}px`
                    };
                } else if (narration.position === 'bottom') {
                    pos = {
                        top: `${Math.min(viewportHeight - balloonHeight - padding, rect.bottom + 15)}px`,
                        left: `${Math.max(padding + balloonWidth / 2, Math.min(rect.left + rect.width / 2, viewportWidth - balloonWidth / 2 - padding))}px`,
                        transform: 'translateX(-50%)',
                        maxWidth: `${Math.min(400, Math.min(rect.width + 40, viewportWidth - padding * 2))}px`
                    };
                } else {
                    // Fallback: use right side if space available, otherwise left, otherwise top
                    if (spaceRight > balloonWidth + padding) {
                        pos = {
                            top: `${Math.max(padding, Math.min(rect.top + rect.height / 2, viewportHeight - balloonHeight / 2 - padding))}px`,
                            left: `${Math.min(viewportWidth - balloonWidth - padding, rect.right + 15)}px`,
                            transform: 'translateY(-50%)',
                            maxWidth: `${Math.min(400, spaceRight - 30)}px`
                        };
                    } else if (spaceLeft > balloonWidth + padding) {
                        pos = {
                            top: `${Math.max(padding, Math.min(rect.top + rect.height / 2, viewportHeight - balloonHeight / 2 - padding))}px`,
                            left: `${Math.max(padding, rect.left - balloonWidth - 15)}px`,
                            transform: 'translateY(-50%)',
                            maxWidth: `${Math.min(400, spaceLeft - 30)}px`
                        };
                    } else {
                        // Use top if no side space
                        pos = {
                            top: `${Math.max(padding, rect.top - balloonHeight - 15)}px`,
                            left: `${Math.max(padding + balloonWidth / 2, Math.min(rect.left + rect.width / 2, viewportWidth - balloonWidth / 2 - padding))}px`,
                            transform: 'translateX(-50%)',
                            maxWidth: `${Math.min(400, Math.min(rect.width + 40, viewportWidth - padding * 2))}px`
                        };
                    }
                }
                
                positionStyle = `top: ${pos.top}; left: ${pos.left}; transform: ${pos.transform}; max-width: ${pos.maxWidth || '420px'};`;
            } else if (isMobile) {
                // On mobile, always position at bottom center
                positionStyle = `bottom: 20px; left: 50%; transform: translateX(-50%); max-width: calc(100% - 20px);`;
            }

            // Fallback to default positions if no target
            if (!positionStyle) {
                const defaultPositions = {
                    'top-center': 'top: 100px; left: 50%; transform: translateX(-50%);',
                    'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);',
                    'left': 'top: 50%; left: 80px; transform: translateY(-50%);',
                    'right': 'top: 50%; right: 80px; transform: translateY(-50%);',
                    'bottom': 'bottom: 100px; left: 50%; transform: translateX(-50%);',
                };
                positionStyle = defaultPositions[narration.position] || defaultPositions['center'];
            }

            container.innerHTML = `
                <div class="tooltip-guide" style="${positionStyle}">
                    <div class="tooltip-agent-header">
                        <span class="tooltip-agent-icon">${renderIconFromString(narration.agentIcon || '💡', 28)}</span>
                        <span class="tooltip-agent-name">${narration.agent}</span>
                        <button class="tooltip-skip-btn" id="narration-skip-btn" title="Skip to next (Space)">
                            <span>Skip</span>
                        </button>
                    </div>
                    ${narration.title ? `<div class="tooltip-title">${narration.title}</div>` : ''}
                    <div class="tooltip-description">${narration.description}</div>
                    ${narration.highlight ? `<div class="tooltip-highlight">${narration.highlight}</div>` : ''}
                </div>
            `;

            // Add click handler for skip button
            const skipBtn = container.querySelector('#narration-skip-btn');
            if (skipBtn) {
                skipBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    demo.skipToNextNarration();
                });
            }

            // Initialize Lucide icons
            initIcons(container);
        }

        guide.subscribe(() => {
            drawTip();
        });

        function drawApp() {
            drawObjectives();
            drawEditor();
            drawCodeInput();
            drawTerminal();
            drawAgents();
            drawTeamInput();

        }

        ws.subscribe(() => {
            drawApp();
        });

        bus.subscribe(ET.SCENARIO_COMPLETE, () => {
            drawPerformanceReport();
        });

        function drawPerformanceReport() {
            const root = $('root');
            
            // Remove any existing performance report first
            const existingReport = qs('.performance-report-overlay');
            if (existingReport) {
                existingReport.remove();
            }
            
            const state = ws.getState();
            const messages = state.ui.messages;
            const timeElapsed = state.scenario.timeElapsed;
            const objectives = state.scenario.objectives;

            // Keep emojis for message chat - they're more expressive and friendly
            const agentAvatars = {
                senior_dev: '👨‍💻',
                pm: '👩‍💼',
                junior_dev: '🧑‍💻',
                incident: '🚨',
                code_assistant: '🤖',
                user: '👤',
            };

            const userMessages = messages.filter(m => m.agentId === 'user');
            const code = state.ui.codeEditorContent || '';

            const formatTime = (seconds) => {
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                return `${minutes}m ${remainingSeconds}s`;
            };

            // Calculate performance metrics
            const completedObjectives = objectives.filter(o => o.completed).length;
            const totalObjectives = objectives.length;
            const questionsAsked = userMessages.filter(m => m.content.includes('?')).length;
            const codeChanges = code !== initialCode;
            const testsPassed = code.includes('amount <= 0') && code.includes('raise');
            const timeScore = timeElapsed < 120 ? 'Excellent' : timeElapsed < 180 ? 'Good' : 'Fair';

            // Agent-specific evaluations
            const agentEvaluations = {
                senior_dev: {
                    avatar: agentAvatars.senior_dev,
                    role: 'Senior Engineer',
                    name: 'Marcus',
                    evaluation: questionsAsked > 2 
                        ? 'Strong analytical thinking demonstrated. You asked thoughtful questions and showed good debugging instincts. The code fix was clean and well-structured.'
                        : 'Good problem-solving approach. Consider asking more questions when stuck - collaboration is key.',
                    strengths: [
                        codeChanges ? 'Identified root cause quickly' : 'Methodical investigation',
                        testsPassed ? 'Clean code implementation' : 'Willing to iterate',
                        questionsAsked > 0 ? 'Proactive communication' : 'Independent problem-solving'
                    ],
                    areas: [
                        questionsAsked === 0 ? 'Ask questions earlier when stuck' : null,
                        timeElapsed > 180 ? 'Work on time management' : null
                    ].filter(Boolean),
                    rating: testsPassed && questionsAsked > 0 ? '9/10' : testsPassed ? '8/10' : '7/10'
                },
                pm: {
                    avatar: agentAvatars.pm,
                    role: 'Product Manager',
                    name: 'Sarah',
                    evaluation: completedObjectives === totalObjectives
                        ? 'Excellent execution! You completed all objectives and kept the team informed. The incident was resolved efficiently.'
                        : 'Good progress, but some objectives remain incomplete. Focus on clear communication and follow-through.',
                    strengths: [
                        completedObjectives === totalObjectives ? '100% objective completion' : 'Steady progress',
                        timeElapsed < 180 ? 'Fast resolution time' : 'Thorough investigation',
                        'Clear communication with team'
                    ],
                    areas: [
                        completedObjectives < totalObjectives ? 'Complete all objectives before closing' : null,
                        timeElapsed > 180 ? 'Improve time-to-resolution' : null
                    ].filter(Boolean),
                    rating: completedObjectives === totalObjectives ? '9/10' : '7/10'
                },
                junior_dev: {
                    avatar: agentAvatars.junior_dev,
                    role: 'Junior Developer',
                    name: 'Alex',
                    evaluation: questionsAsked > 0
                        ? 'Great collaboration! You explained concepts clearly and helped me understand the connection to related systems. Keep up the knowledge sharing!'
                        : 'Good technical work. Consider explaining your thought process to help teammates learn.',
                    strengths: [
                        'Technical problem-solving',
                        questionsAsked > 0 ? 'Knowledge sharing' : 'Independent work',
                        'Attention to related systems'
                    ],
                    areas: [
                        questionsAsked === 0 ? 'Share knowledge with team more' : null,
                        'Document your approach for future reference'
                    ].filter(Boolean),
                    rating: questionsAsked > 0 ? '8/10' : '7/10'
                },
                incident: {
                    avatar: agentAvatars.incident,
                    role: 'Incident System',
                    name: 'System Monitor',
                    evaluation: testsPassed && completedObjectives === totalObjectives
                        ? 'Incident resolved successfully. All validation checks passed. System stability restored.'
                        : 'Incident partially resolved. Some validation issues may remain.',
                    strengths: [
                        testsPassed ? 'All tests passing' : 'Progress made',
                        completedObjectives === totalObjectives ? 'All objectives met' : 'Ongoing resolution',
                        `Resolution time: ${formatTime(timeElapsed)}`
                    ],
                    areas: [
                        !testsPassed ? 'Ensure all tests pass before deployment' : null,
                        completedObjectives < totalObjectives ? 'Complete all validation checks' : null
                    ].filter(Boolean),
                    rating: testsPassed && completedObjectives === totalObjectives ? '10/10' : '7/10'
                }
            };

            const reportHtml = `
                <div class="performance-report-overlay">
                    <div class="report-card">
                        <h2 class="report-title">Candidate Performance Evaluation</h2>
                        <p class="report-subtitle">Scenario: Payment API Debugging - Completed in ${formatTime(timeElapsed)}</p>

                        <div class="report-metrics">
                            <div class="metric-item">
                                <span class="metric-value">${completedObjectives}/${totalObjectives}</span>
                                <span class="metric-label">Objectives</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-value">${timeScore}</span>
                                <span class="metric-label">Time Score</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-value">${questionsAsked}</span>
                                <span class="metric-label">Questions Asked</span>
                            </div>
                        </div>

                        <h3 class="agent-section-title">Agent Evaluations</h3>
                        <div class="agent-contributions">
                            ${Object.entries(agentEvaluations).map(([id, eval]) => `
                                <div class="agent-stat-card agent-${id}">
                                    <div class="agent-header">
                                        <span class="agent-avatar">${eval.avatar}</span>
                                        <div class="agent-info">
                                            <span class="agent-role">${eval.name} - ${eval.role}</span>
                                            <span class="agent-id">Rating: ${eval.rating}</span>
                                        </div>
                                    </div>
                                    <div class="agent-evaluation">
                                        <p class="evaluation-text">${eval.evaluation}</p>
                                        <div class="evaluation-details">
                                            <div class="strengths">
                                                <strong>Strengths:</strong>
                                                <ul>
                                                    ${eval.strengths.map(s => `<li>${s}</li>`).join('')}
                                                </ul>
                                            </div>
                                            ${eval.areas.length > 0 ? `
                                                <div class="areas">
                                                    <strong>Areas for Growth:</strong>
                                                    <ul>
                                                        ${eval.areas.map(a => `<li>${a}</li>`).join('')}
                                                    </ul>
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <button class="btn-primary btn-large" onclick="window.location.reload()">Restart Demo</button>
                    </div>
                </div>
            `;

            root.innerHTML += reportHtml;
        }

        // The old showOverlay function is removed to fix the double "Challenge Complete" issue.

        function createIntroOverlay() {
            const root = $('root');
            if (!root || qs('.intro-overlay')) {
                return;
            }

            const overlay = document.createElement('div');
            overlay.className = 'intro-overlay';
            overlay.innerHTML = `
                <div class="intro-card">
                    <span class="intro-icon">${renderIcon('rocket', 56)}</span>
                    <h2>Explore SimuWork</h2>
                    <p>Watch our AI mentors collaborate in real time as they guide you through a payment API debugging challenge.</p>
                    <button class="btn-primary btn-large" id="intro-start-btn">Start Demo</button>
                </div>
            `;

            root.appendChild(overlay);

            // Initialize icons
            initIcons(overlay);

            const startBtn = $('intro-start-btn');
            if (startBtn) {
                startBtn.addEventListener('click', startDemo);
            }
        }

        function init() {
            const root = $('root');

            setTimeout(() => {
                root.innerHTML = `
                    <div class="interactive-app">
                        <header class="app-header">
                            <div class="header-left">
                                <img src="logo.png" alt="SimuWork logo" class="app-logo" />
                                <div class="app-title-group">
                                    <h1 class="app-title">
                                        SimuWork <span class="live-badge"><span class="live-dot"></span>LIVE</span>
                                    </h1>
                                    <p class="app-subtitle">AI-Powered Job Simulation Platform</p>
                                </div>
                            </div>
                            <div class="header-right">
                                <div class="status-indicator">
                                    <span class="status-dot"></span>
                                    Agents Active
                                </div>
                            </div>
                        </header>

                        <main class="app-main">
                            <div class="left-column">
                                <section class="section objectives-section" id="objectives-panel"></section>
                                <section class="section terminal-section" id="terminal-output"></section>
                            </div>

                            <div class="center-column">
                                <section class="section code-section" id="code-editor"></section>
                                <div id="code-assistant-input"></div>
                            </div>

                            <div class="right-column">
                                <section class="section messages-section" id="agent-messages"></section>
                                <div id="team-chat-input"></div>
                            </div>
                        </main>

                        <div id="tooltip-guide"></div>

                        <footer class="app-footer">
                            <p class="footer-text">💡 Train your critical thinking with AI assistance - Ask questions, get help, and learn by doing</p>
                        </footer>
                    </div>
                `;

                orch.initialize();

                drawApp();
                createIntroOverlay();
                
                // Initialize icons globally
                setTimeout(() => {
                    initIcons();
                }, 100);
            }, 2300);
        }

        function startDemo() {
            const introOverlay = qs('.intro-overlay');
            if (introOverlay) {
                introOverlay.remove();
            }

            const headerRight = qs('.header-right');
            if (headerRight && !headerRight.querySelector('.btn-secondary')) {
                const restartBtn = document.createElement('button');
                restartBtn.type = 'button';
                restartBtn.className = 'btn-secondary';
                restartBtn.textContent = 'Restart';
                restartBtn.addEventListener('click', () => window.location.reload());
                const status = headerRight.querySelector('.status-indicator');
                if (status) {
                    headerRight.insertBefore(restartBtn, status);
                } else {
                    headerRight.appendChild(restartBtn);
                }
            }

            demo.start();
        }

        // Keyboard support for skipping narrations and starting demo
        document.addEventListener('keydown', (e) => {
            // Only handle spacebar if not typing in an input field
            if (e.key === ' ' || e.key === 'Spacebar') {
                const activeElement = document.activeElement;
                const isInputFocused = activeElement && (
                    activeElement.tagName === 'INPUT' ||
                    activeElement.tagName === 'TEXTAREA' ||
                    activeElement.isContentEditable
                );
                
                if (!isInputFocused) {
                    // Check if intro overlay is visible
                    const introOverlay = qs('.intro-overlay');
                    if (introOverlay) {
                        e.preventDefault();
                        startDemo();
                    } else if (guide.getCurrentNarration()) {
                        // Skip to next narration if one is showing
                        e.preventDefault();
                        demo.skipToNextNarration();
                    }
                }
            }
        });

        // Handle window resize for responsive tooltip positioning
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // Reposition tooltip if one is showing
                if (guide.getCurrentNarration()) {
                    drawTip();
                }
                // Redraw app to ensure proper layout
                drawApp();
            }, 150);
        });

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
