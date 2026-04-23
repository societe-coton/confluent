import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { AdminGuard } from '../auth/guards/admin.guard'
import { QuestionnairesService } from '../questionnaires/questionnaires.service'

const fieldTypeSchema = z.enum([
  'text',
  'textarea',
  'email',
  'number',
  'date',
  'select',
  'checkbox',
  'file',
])

const fieldInputSchema = z.object({
  section: z.string().min(1).max(200),
  label: z.string().min(1).max(500),
  fieldType: fieldTypeSchema,
  required: z.boolean().default(false),
  orderIndex: z.number().int().min(0),
})

const createVersionSchema = z.object({
  fields: z.array(fieldInputSchema).min(1).max(500),
})

const patchFieldSchema = z
  .object({
    label: z.string().min(1).max(500).optional(),
    fieldType: fieldTypeSchema.optional(),
    required: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: 'At least one field must be provided.',
  })

class CreateVersionDto extends createZodDto(createVersionSchema) {}
class PatchFieldDto extends createZodDto(patchFieldSchema) {}

@UseGuards(AdminGuard)
@Controller('admin/questionnaire/versions')
export class AdminQuestionnaireController {
  constructor(private readonly service: QuestionnairesService) {}

  @Get()
  listVersions() {
    return this.service.listVersions()
  }

  @Post()
  create(@Body() body: CreateVersionDto) {
    return this.service.createVersion(body.fields)
  }

  @Patch(':versionId/fields/:fieldId')
  patchField(
    @Param('versionId') versionId: string,
    @Param('fieldId') fieldId: string,
    @Body() body: PatchFieldDto,
  ) {
    return this.service.updateField(versionId, fieldId, body)
  }
}
