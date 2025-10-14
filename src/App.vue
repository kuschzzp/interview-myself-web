<template>
	<div class="container">
		<h1>自我挑战 · 面试助手</h1>
		<p class="desc">按步骤完成：上传与岗位 → 生成自我介绍 → 生成/选择大纲 → 生成问题与回答分析。</p>

		<el-steps :active="state.currentStep" finish-status="success" style="margin-bottom: 16px;">
			<el-step title="上传与岗位" />
			<el-step title="自我介绍与大纲" />
			<el-step title="问题与回答分析" />
		</el-steps>

		<div class="steps">
			<!-- Step 0: 上传与岗位 + 生成自我介绍 -->
			<div v-if="state.currentStep === 0">
                <UploadAndGoal
                    v-model:jobGoal="state.jobGoal"
                    v-model:file-list="state.resumeFileList"
                    :loading="state.loadingIntro"
                    @file-selected="(f: File) => (state.resumePdf = f)"
                    @request-generate="onRequestGenerate"
                />
				<IntroDisplay :intro="state.selfIntro" />
				<div style="margin-top: 16px; display: flex; justify-content: flex-end;">
					<el-button type="primary" :disabled="!state.selfIntro" @click="nextStep">下一步</el-button>
				</div>
			</div>

			<!-- Step 1: 生成与选择大纲 -->
			<div v-else-if="state.currentStep === 1">
				<OutlineList
					:outline="state.outline"
					:loading="state.loadingOutline"
					@select-outline="onSelectOutline"
					@gen-outline="onGenerateOutline"
				/>
				<div style="margin-top: 16px; display: flex; justify-content: space-between;">
					<el-button @click="prevStep">上一步</el-button>
					<el-button type="primary" :disabled="!state.selectedOutline" @click="nextStep">下一步</el-button>
				</div>
			</div>

			<!-- Step 2: 生成问题与回答分析 -->
			<div v-else>
				<el-alert type="warning" show-icon :closable="false" style="margin-bottom: 12px;"
					title="如需更换面试大纲条目，请点击右侧按钮返回上一步重新选择。">
					<template #default>
						<el-button size="small" type="warning" plain @click="goToOutlineStep">返回大纲选择</el-button>
					</template>
				</el-alert>
				<QuestionComposer
					:selected="state.selectedOutline"
					:loading="state.loadingQuestions"
					@gen-questions="onGenerateQuestions"
				/>
				<QuestionList
					:questions="state.questions"
					:analyzing-ids="Array.from(state.loadingAnalyzeIds)"
					@analyze="onAnalyze"
				/>
				<div style="margin-top: 16px; display: flex; justify-content: space-between;">
					<el-button @click="prevStep">上一步</el-button>
					<el-button type="primary" @click="goToOutlineStep" plain>重新选择大纲</el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { processResume, generateSelfIntroduction, generateInterviewOutline, generateQuestions, analyzeAnswer } from './api/client';
import UploadAndGoal from './components/UploadAndGoal.vue';
import IntroDisplay from './components/IntroDisplay.vue';
import OutlineList from './components/OutlineList.vue';
import QuestionComposer from './components/QuestionComposer.vue';
import QuestionList from './components/QuestionList.vue';

type Question = {
	 id: string;
	 text: string;
	 answer?: string;
	 analysis?: string;
	 standardAnswer?: string;
};

const state = reactive({
	resumePdf: undefined as File | undefined,
    resumeFileList: [] as any[],
	jobGoal: '',
	selfIntro: '',
	outline: [] as string[],
	selectedOutline: '',
	questions: [] as Question[],
	pdfText: '',
	loadingIntro: false,
	loadingOutline: false,
	loadingQuestions: false,
	loadingAnalyzeIds: new Set<string>(),
	currentStep: 0,
});

async function onRequestGenerate(payload: { resume?: File; jobGoal: string }) {
    try {
        state.loadingIntro = true;
        state.resumePdf = payload.resume;
        state.jobGoal = payload.jobGoal || '';
        // 清空旧的自我介绍，避免旧内容残留
        state.selfIntro = '';

        if (!state.resumePdf) {
            ElMessage.error('请先选择 PDF 简历文件');
            return;
        }

        // 1. 提取 PDF 文本
        const { pdf_text } = await processResume(state.resumePdf);
        state.pdfText = pdf_text || '';

        // 2. 生成自我介绍
        const { self_introduction } = await generateSelfIntroduction({
            job_description: state.jobGoal,
            pdf_text: state.pdfText,
        });
        state.selfIntro = self_introduction || '';
        ElMessage.success('自我介绍生成成功');
        // 可选：自动进入下一步
        // if (state.selfIntro) state.currentStep = 1;
    } catch (e: any) {
        ElMessage.error(e?.message || '生成失败');
    } finally {
        state.loadingIntro = false;
    }
}

async function onGenerateOutline() {
    try {
        state.loadingOutline = true;
        const { outline } = await generateInterviewOutline({
            job_description: state.jobGoal,
            pdf_text: state.pdfText,
        });
        state.outline = outline || [];
        ElMessage.success('面试大纲生成成功');
    } catch (e: any) {
        ElMessage.error(e?.message || '生成大纲失败');
    } finally {
        state.loadingOutline = false;
    }
}

function onSelectOutline(item: string) {
	state.selectedOutline = item;
	// 清空旧问题，避免不同条目混淆
	state.questions = [];
	ElMessage.success('已选择大纲条目，已为你跳转到问题生成与回答步骤');
	// 自动进入第三步，问题编辑区会自动填充选中大纲内容
	state.currentStep = 2;
}

async function onGenerateQuestions(topic: string) {
    try {
        state.loadingQuestions = true;
        const { questions } = await generateQuestions({ interview_outline_item: topic });
        const now = Date.now();
        state.questions = (questions || []).map((text, i) => ({ id: `${now}-${i+1}`, text }));
        ElMessage.success('问题列表生成成功');
    } catch (e: any) {
        ElMessage.error(e?.message || '生成问题失败');
    } finally {
        state.loadingQuestions = false;
    }
}

async function onAnalyze(q: { id: string; answer: string }) {
    const idx = state.questions.findIndex(x => x.id === q.id);
    if (idx === -1) return;
    try {
        state.loadingAnalyzeIds.add(q.id);
        const { answer_evaluation, standard_answer } = await analyzeAnswer({
            question: state.questions[idx].text,
            user_answer: q.answer || '',
        });
        state.questions[idx].answer = q.answer;
        state.questions[idx].analysis = answer_evaluation || '';
        state.questions[idx].standardAnswer = standard_answer || '';
        ElMessage.success('分析完成');
    } catch (e: any) {
        ElMessage.error(e?.message || '分析失败');
    } finally {
        state.loadingAnalyzeIds.delete(q.id);
    }
}

function nextStep() {
	if (state.currentStep < 2) state.currentStep += 1;
}

function prevStep() {
	if (state.currentStep > 0) state.currentStep -= 1;
}

function goToOutlineStep() {
	state.currentStep = 1;
	// 返回大纲时清空历史问题，避免残留
	state.questions = [];
}
</script>

<style scoped>
.container {
	max-width: 960px;
	margin: 0 auto;
	padding: 24px;
}
.desc {
	color: #666;
	margin-bottom: 16px;
}
.steps > * + * {
	margin-top: 24px;
}
h1 {
	font-size: 22px;
	margin: 0 0 8px;
}
</style>


