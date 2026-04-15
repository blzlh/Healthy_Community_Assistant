/**
 * 健康分析相关 DTO
 */

import { IsOptional, IsNumber, IsString, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyzeHealthDto {
    @ApiPropertyOptional({ example: '120/80 mmHg', description: '血压' })
    @IsOptional()
    @IsString()
    bloodPressure?: string;

    @ApiPropertyOptional({ example: '72次/分钟', description: '心率' })
    @IsOptional()
    @IsString()
    heartRate?: string;

    @ApiPropertyOptional({ example: '5.5 mmol/L', description: '血糖' })
    @IsOptional()
    @IsString()
    bloodSugar?: string;

    @ApiPropertyOptional({ example: '70kg', description: '体重' })
    @IsOptional()
    @IsString()
    weight?: string;

    @ApiPropertyOptional({ example: '175cm', description: '身高' })
    @IsOptional()
    @IsString()
    height?: string;

    @ApiPropertyOptional({ example: 30, description: '年龄' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(150)
    age?: number;

    @ApiPropertyOptional({ example: 7, description: '睡眠时长（小时）' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(24)
    sleepHours?: number;

    @ApiPropertyOptional({ example: 30, description: '运动时长（分钟）' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    exerciseMinutes?: number;

    @ApiPropertyOptional({ example: 'user-session-123', description: '会话ID（用于多轮对话）' })
    @IsOptional()
    @IsString()
    sessionId?: string;

    @ApiPropertyOptional({ example: 'uuid', description: '对话ID（用于保存消息到数据库）' })
    @IsOptional()
    @IsUUID()
    conversationId?: string;
}

export class ContinueConversationDto {
    @ApiProperty({ example: '我应该如何降低血压？', description: '用户问题' })
    @IsString()
    question: string;

    @ApiProperty({ example: 'user-session-123', description: '会话ID' })
    @IsString()
    sessionId: string;

    @ApiPropertyOptional({ example: 'uuid', description: '对话ID（用于保存消息到数据库）' })
    @IsOptional()
    @IsUUID()
    conversationId?: string;
}

export class HealthAnalysisResponseDto {
    @ApiProperty({ description: 'AI 分析结果' })
    analysis: string;

    @ApiProperty({ description: '会话ID' })
    sessionId: string;

    @ApiProperty({ description: '时间戳' })
    timestamp: string;
}

export class AgentHealthStatusDto {
    @ApiProperty({ description: '服务状态' })
    status: 'ok' | 'error';

    @ApiProperty({ description: '状态消息' })
    message: string;
}
