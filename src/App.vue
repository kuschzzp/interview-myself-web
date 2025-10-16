<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <!-- Header -->
    <header class="backdrop-blur-md bg-white/80 shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div class="container mx-auto px-6 py-6 flex justify-center items-center">
        <div class="flex items-center space-x-4">
          <i class="fas fa-robot text-3xl text-blue-600"></i>
          <h1 class="text-3xl font-bold text-gray-800 flex items-center">
            AI 面试助手
            <span class="ml-2 text-sm font-normal bg-blue-100/80 text-blue-800 px-3 py-1 rounded-full backdrop-blur-sm">Beta</span>
          </h1>
          <i class="fas fa-stars text-3xl text-yellow-500"></i>
        </div>
      </div>
    </header>

    <!-- Progress Bar -->
    <div class="container mx-auto px-6 py-6">
      <div class="backdrop-blur-sm bg-white/60 rounded-2xl p-6 shadow-lg border border-white/30">
        <div class="flex justify-between relative">
          <!-- 进度条背景线 -->
          <div class="absolute top-6 left-6 right-6 h-2 bg-gray-200/60 -z-10 rounded-full"></div>
          <!-- 进度条进度线 -->
          <div
              class="absolute top-6 left-6 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 -z-10 transition-all duration-500 rounded-full"
              :style="{ width: progressWidth }"
          ></div>
          <!-- 步骤按钮 -->
          <div
              v-for="(step, index) in steps"
              :key="index"
              class="flex flex-col items-center relative z-10"
          >
            <div
                class="w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 backdrop-blur-sm"
                :class="{
								'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg': state.currentStep >= index,
								'bg-white/80 border-2 border-gray-300/60 text-gray-400 shadow-sm': state.currentStep < index
							}"
            >
              <i :class="step.icon"></i>
            </div>
            <span class="text-sm font-medium text-gray-600">{{ step.title }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主页面 -->
    <div v-if="!showQuestionsPage">
      <main class="container mx-auto px-6 py-8">
        <!-- Step 1: Upload & Job Description -->
        <section
            class="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl p-8 mb-8 transition-all duration-300 border border-white/30"
            :class="{ 'opacity-50 pointer-events-none': state.currentStep < 0 }"
        >
          <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span
                class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center mr-3 backdrop-blur-sm">1</span>
            上传简历与岗位说明
          </h2>

          <UploadAndGoal
              v-model:jobGoal="state.jobGoal"
              v-model:file-list="state.resumeFileList"
              :loading="state.loadingIntro"
              @file-selected="(f: File) => (state.resumePdf = f)"
              @request-generate="onRequestGenerate"
          />

          <!-- Self Introduction Display -->
          <div v-if="state.selfIntro"
               class="mt-8 p-6 backdrop-blur-sm bg-blue-50/80 rounded-xl border border-blue-200/50">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-800">为您生成的个性化自我介绍：</h3>
              <button
                  class="!rounded-button whitespace-nowrap px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 text-sm shadow-lg hover:shadow-xl backdrop-blur-sm flex items-center"
                  @click="copySelfIntro"
              >
                <i class="fas fa-copy mr-1"></i>复制
              </button>
            </div>
            <p class="text-gray-700 whitespace-pre-line">{{ state.selfIntro }}</p>
          </div>

          <div class="mt-8 flex justify-between">
            <button
                class="!rounded-button whitespace-nowrap px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl backdrop-blur-sm"
                @click="onRequestGenerate({ resume: state.resumePdf, jobGoal: state.jobGoal })"
                :disabled="!state.resumePdf || !state.jobGoal || state.loadingIntro"
                :class="{ 'opacity-50 cursor-not-allowed': !state.resumePdf || !state.jobGoal || state.loadingIntro }"
            >
              <i class="fas fa-magic mr-2"></i>
              <span v-if="state.loadingIntro">生成中...</span>
              <span v-else>生成个性化自我介绍</span>
            </button>
            <button
                v-if="state.selfIntro"
                class="!rounded-button whitespace-nowrap px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl backdrop-blur-sm"
                @click="nextStep"
            >
              <i class="fas fa-list mr-2"></i>生成面试大纲
            </button>
          </div>
        </section>

        <!-- Step 2: Interview Outline -->
        <section
            class="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl p-8 mb-8 transition-all duration-300 border border-white/30"
            :class="{ 'opacity-50 pointer-events-none': state.currentStep < 1 }"
        >
          <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span
                class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center mr-3 backdrop-blur-sm">2</span>
            生成面试大纲
          </h2>

          <OutlineList
              :outline="state.outline"
              :loading="state.loadingOutline"
              :selected-outline="state.selectedOutline"
              @select-outline="onSelectOutline"
              @gen-outline="onGenerateOutline"
          />
        </section>
      </main>
    </div>

    <!-- 问题页面 -->
    <QuestionsPage
        v-else
        :selected-outline="state.selectedOutline"
        :questions="state.questions"
        :loading-questions="state.loadingQuestions"
        :loading-analyze-ids="state.loadingAnalyzeIds"
        @back-to-outline="backToOutline"
        @generate-questions="onGenerateQuestions"
        @analyze="onAnalyze"
    />

    <!-- Footer -->
    <footer class="backdrop-blur-md bg-white/60 border-t border-white/30 mt-12 py-8">
      <div class="container mx-auto px-6">
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-800">你的贴心 AI 面试助手</h3>
          <p class="text-gray-600 mt-2">提升面试表现，赢得理想工作</p>
        </div>
        <div class="mt-6 text-center text-gray-500 text-sm">
          <p>© 2025 AI 面试助手. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {computed, reactive, ref} from 'vue';
import {ElMessage} from 'element-plus';
import {
  analyzeAnswer,
  generateInterviewOutline,
  generateQuestions,
  generateSelfIntroduction,
  processResume
} from './api/client';
import UploadAndGoal from './components/UploadAndGoal.vue';
import OutlineList from './components/OutlineList.vue';
import QuestionsPage from './components/QuestionsPage.vue';

// 步骤数据
const steps = [
  {title: '上传简历', icon: 'fas fa-file-upload'},
  {title: '生成大纲', icon: 'fas fa-list'},
  {title: '问题分析', icon: 'fas fa-comments'}
];

// 进度条宽度计算
const progressWidth = computed(() => {
  if (state.currentStep === 0) return '0%';
  if (state.currentStep === 1) return '50%';
  return '100%';
});

// 页面状态
const showQuestionsPage = ref(false);

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
    state.selfIntro = '';

    if (!state.resumePdf) {
      ElMessage.error('请先选择 PDF 简历文件');
      return;
    }

    const {pdf_text} = await processResume(state.resumePdf);
    state.pdfText = pdf_text || '';

    const {self_introduction} = await generateSelfIntroduction({
      job_description: state.jobGoal,
      pdf_text: state.pdfText,
    });
    state.selfIntro = self_introduction || '';
    ElMessage.success('自我介绍生成成功');
  } catch (e: any) {
    ElMessage.error(e?.message || '生成失败');
  } finally {
    state.loadingIntro = false;
  }
}

async function onGenerateOutline() {
  try {
    state.loadingOutline = true;
    const {outline} = await generateInterviewOutline({
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
  state.questions = [];
  ElMessage.success('已选择大纲条目，正在跳转到问题分析页面...');
  // 直接跳转到问题页面
  goToQuestionsPage();
}

function goToQuestionsPage() {
  if (!state.selectedOutline) {
    ElMessage.warning('请先选择一个面试大纲');
    return;
  }
  showQuestionsPage.value = true;
}

function backToMain() {
  showQuestionsPage.value = false;
}

function backToOutline() {
  showQuestionsPage.value = false;
  state.currentStep = 1; // 跳转到大纲选择步骤
  state.questions = []; // 清空问题
  // 滚动到选中的大纲条目
  setTimeout(() => {
    const selectedIndex = state.outline.findIndex(item => item === state.selectedOutline);
    if (selectedIndex >= 0) {
      // 查找选中的大纲条目元素
      const outlineItems = document.querySelectorAll('.outline-item');
      if (outlineItems[selectedIndex]) {
        outlineItems[selectedIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    } else {
      // 如果没有选中项，滚动到大纲区域顶部
      const outlineSection = document.querySelector('section:nth-child(2)');
      if (outlineSection) {
        outlineSection.scrollIntoView({behavior: 'smooth'});
      }
    }
  }, 100);
}

async function onGenerateQuestions(topic: string) {
  try {
    state.loadingQuestions = true;
    const {questions} = await generateQuestions({interview_outline_item: topic});
    const now = Date.now();
    state.questions = (questions || []).map((text, i) => ({id: `${now}-${i + 1}`, text}));
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
    const {answer_evaluation, standard_answer} = await analyzeAnswer({
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
  state.questions = [];
}

// 复制自我介绍功能
async function copySelfIntro() {
  if (!state.selfIntro) return;

  try {
    await navigator.clipboard.writeText(state.selfIntro);
    ElMessage.success('自我介绍已复制到剪贴板');
  } catch (err) {
    // 降级方案：使用传统方法
    const textArea = document.createElement('textarea');
    textArea.value = state.selfIntro;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    ElMessage.success('自我介绍已复制到剪贴板');
  }
}
</script>

<style scoped>
/* 自定义样式 */
.rounded-button {
  border-radius: 0.5rem;
}
</style>