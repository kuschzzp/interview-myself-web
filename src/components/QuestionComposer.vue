<template>
	<section class="card">
		<h2>4. 选择条目后填入下方，可修改后生成问题</h2>
    <el-input
            v-model="topic"
            type="textarea"
            :rows="4"
            placeholder="选择某一条后会填入这里，支持自由编辑"
    />
    <div class="row">
            <el-button type="primary" @click="emitGen" :disabled="!topic.trim() || loading" :loading="loading">生成问题</el-button>
    </div>
	</section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
const props = defineProps<{ selected: string; loading?: boolean }>();
const emit = defineEmits<{ (e: 'gen-questions', topic: string): void }>();

const topic = ref('');
watch(
	() => props.selected,
	(v) => { topic.value = v || ''; },
	{ immediate: true }
);

function emitGen() {
	emit('gen-questions', topic.value.trim());
}
</script>

<style scoped>
.card {
	border: 1px solid #eee;
	border-radius: 8px;
	padding: 16px;
	background: #fff;
}
.textarea {
	width: 100%;
	padding: 8px 10px;
	border: 1px solid #ddd;
	border-radius: 6px;
}
.row { margin-top: 12px; }
.btn {
	padding: 8px 14px;
	background: #2f66f6;
	color: #fff;
	border: none;
	border-radius: 6px;
	cursor: pointer;
}
.btn:disabled { opacity: .6; cursor: not-allowed; }
</style>


