<template>
	<section class="card">
		<el-card v-if="intro" shadow="hover" class="intro-card">
			<template #header>
				<div class="card-header">
					<span>2. 生成的自我介绍</span>
					<div class="tools">
						<el-button size="small" text @click="copy">复制</el-button>
					</div>
				</div>
			</template>
			<div class="intro-text">{{ intro }}</div>
		</el-card>
		<el-empty v-else description="请先在上方生成自我介绍" />
	</section>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
const props = defineProps<{ intro: string }>();

async function copy() {
	try {
		await navigator.clipboard.writeText(props.intro || '');
		ElMessage.success('已复制到剪贴板');
	} catch {
		ElMessage.error('复制失败');
	}
}
</script>

<style scoped>
.card {
	border: 1px solid #eee;
	border-radius: 8px;
	padding: 16px;
	background: #fff;
}
.intro-card { border: none; }
.card-header { display: flex; align-items: center; justify-content: space-between; font-weight: 600; }
.intro-text {
	white-space: pre-wrap;
	line-height: 1.8;
	font-size: 14px;
	color: #2a2a2a;
	background: #fafcff;
	border: 1px solid #e6edf5;
	border-radius: 8px;
	padding: 14px 16px;
}
</style>


