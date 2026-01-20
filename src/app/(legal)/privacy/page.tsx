"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Mail, Trash2 } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Background grid */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="relative max-w-4xl mx-auto px-4 py-8">
                <Link href="/register">
                    <Button variant="ghost" size="sm" className="mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al registro
                    </Button>
                </Link>

                <Card className="border-border/50 bg-card/95 backdrop-blur">
                    <CardHeader className="text-center border-b">
                        <div className="flex justify-center mb-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Shield className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl">Política de Privacidad</CardTitle>
                        <p className="text-muted-foreground mt-2">
                            Última actualización: Enero 2025
                        </p>
                    </CardHeader>

                    <CardContent className="prose prose-gray dark:prose-invert max-w-none p-8 space-y-8">
                        {/* Introducción */}
                        <section>
                            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                                <Eye className="h-5 w-5 text-primary" />
                                1. Introducción
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                En <strong>LLM Comparison</strong>, nos comprometemos a proteger la privacidad y seguridad
                                de los datos personales de nuestros usuarios. Esta política describe cómo recopilamos,
                                usamos, almacenamos y protegemos su información cuando utiliza nuestra plataforma de
                                comparación de modelos de lenguaje (LLMs) para generación de código.
                            </p>
                            <p className="text-muted-foreground leading-relaxed mt-3">
                                Al registrarse y utilizar nuestros servicios, usted acepta las prácticas descritas
                                en esta política de privacidad.
                            </p>
                        </section>

                        {/* Datos que recopilamos */}
                        <section>
                            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                                <Database className="h-5 w-5 text-primary" />
                                2. Datos que Recopilamos
                            </h2>

                            <h3 className="font-medium mt-4 mb-2">2.1 Información de Registro</h3>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                                <li>Nombre y apellido (opcional)</li>
                                <li>Dirección de correo electrónico</li>
                                <li>Contraseña (almacenada de forma cifrada)</li>
                                <li>Tipo de cuenta (Usuario Developer o Evaluador)</li>
                            </ul>

                            <h3 className="font-medium mt-4 mb-2">2.2 Datos de Uso</h3>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                                <li>Consultas de código enviadas a los modelos de IA</li>
                                <li>Código generado por los diferentes LLMs</li>
                                <li>Métricas de análisis de código (complejidad, seguridad, etc.)</li>
                                <li>Evaluaciones cualitativas realizadas</li>
                                <li>Estadísticas de uso de la plataforma</li>
                            </ul>

                            <h3 className="font-medium mt-4 mb-2">2.3 Datos Técnicos</h3>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                                <li>Dirección IP</li>
                                <li>Tipo de navegador y dispositivo</li>
                                <li>Fecha y hora de acceso</li>
                            </ul>
                        </section>

                        {/* Uso de los datos */}
                        <section>
                            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                                <UserCheck className="h-5 w-5 text-primary" />
                                3. Cómo Usamos sus Datos
                            </h2>
                            <p className="text-muted-foreground leading-relaxed mb-3">
                                Utilizamos la información recopilada para:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Proporcionar y mantener el servicio de comparación de LLMs</li>
                                <li>Autenticar su identidad y gestionar su cuenta</li>
                                <li>Procesar sus consultas y generar código a través de los diferentes modelos</li>
                                <li>Realizar análisis cuantitativos y cualitativos del código generado</li>
                                <li>Generar estadísticas agregadas y anónimas para mejorar el servicio</li>
                                <li>Enviar notificaciones importantes sobre su cuenta o el servicio</li>
                                <li>Responder a sus consultas de soporte</li>
                                <li>Cumplir con obligaciones legales</li>
                            </ul>
                        </section>

                        {/* Seguridad */}
                        <section>
                            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                                <Lock className="h-5 w-5 text-primary" />
                                4. Seguridad de los Datos
                            </h2>
                            <p className="text-muted-foreground leading-relaxed mb-3">
                                Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li><strong>Cifrado de contraseñas:</strong> Todas las contraseñas se almacenan utilizando
                                    algoritmos de hash seguros (bcrypt)</li>
                                <li><strong>Conexiones seguras:</strong> Utilizamos HTTPS para todas las comunicaciones</li>
                                <li><strong>Autenticación JWT:</strong> Tokens de acceso seguros con expiración automática</li>
                                <li><strong>Autenticación de dos factores (2FA):</strong> Opción disponible para mayor seguridad</li>
                                <li><strong>Control de acceso:</strong> Sistema de roles que limita el acceso a la información</li>
                                <li><strong>Monitoreo:</strong> Vigilancia continua de actividades sospechosas</li>
                            </ul>
                        </section>

                        {/* Compartir datos */}
                        <section>
                            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                                5. Compartición de Datos
                            </h2>
                            <p className="text-muted-foreground leading-relaxed mb-3">
                                <strong>No vendemos ni alquilamos</strong> sus datos personales a terceros.
                                Sin embargo, podemos compartir información en las siguientes circunstancias:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li><strong>Proveedores de LLM:</strong> Las consultas de código se envían a los proveedores
                                    de modelos (OpenAI, Anthropic, Google, etc.) para generar respuestas. Estas consultas
                                    no incluyen información personal identificable.</li>
                                <li><strong>Evaluadores:</strong> Si usted es usuario Developer, sus códigos generados
                                    pueden ser evaluados por Evaluadores registrados. Los evaluadores ven su nombre
                                    para identificar el trabajo, pero no tienen acceso a otros datos personales.</li>
                                <li><strong>Requisitos legales:</strong> Cuando sea requerido por ley o autoridades competentes.</li>
                            </ul>
                        </section>

                        {/* Retención */}
                        <section>
                            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                                6. Retención de Datos
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Conservamos sus datos personales mientras su cuenta esté activa o según sea necesario
                                para proporcionarle servicios. Si desea eliminar su cuenta, puede hacerlo desde la
                                configuración de su perfil. Tras la eliminación, sus datos personales serán eliminados
                                en un plazo de 30 días, excepto cuando debamos conservarlos por obligaciones legales.
                            </p>
                        </section>

                        {/* Derechos */}
                        <section>
                            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                                <Trash2 className="h-5 w-5 text-primary" />
                                7. Sus Derechos
                            </h2>
                            <p className="text-muted-foreground leading-relaxed mb-3">
                                Usted tiene los siguientes derechos sobre sus datos personales:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
                                <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                                <li><strong>Eliminación:</strong> Solicitar la eliminación de sus datos</li>
                                <li><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado</li>
                                <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
                                <li><strong>Retiro del consentimiento:</strong> Retirar su consentimiento en cualquier momento</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-3">
                                Para ejercer estos derechos, contáctenos a través del correo electrónico proporcionado
                                en la sección de contacto.
                            </p>
                        </section>

                        {/* Cookies */}
                        <section>
                            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                                8. Cookies y Tecnologías Similares
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Utilizamos cookies y almacenamiento local del navegador para:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                                <li>Mantener su sesión iniciada</li>
                                <li>Recordar sus preferencias (tema claro/oscuro)</li>
                                <li>Mejorar la seguridad de la plataforma</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-3">
                                No utilizamos cookies de seguimiento ni publicidad de terceros.
                            </p>
                        </section>

                        {/* Contacto */}
                        <section>
                            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                                <Mail className="h-5 w-5 text-primary" />
                                9. Contacto
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Si tiene preguntas sobre esta política de privacidad o sobre el tratamiento de sus
                                datos personales, puede contactarnos a través de:
                            </p>
                            <div className="mt-3 p-4 rounded-lg bg-muted/50 border">
                                <p className="font-medium">LLM Comparison - Soporte de Privacidad</p>
                                <p className="text-muted-foreground">Email: privacy@llmcomparison.com</p>
                            </div>
                        </section>

                        {/* Cambios */}
                        <section>
                            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                                10. Cambios a esta Política
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos
                                cualquier cambio significativo por correo electrónico o mediante un aviso en la
                                plataforma. Le recomendamos revisar esta política periódicamente.
                            </p>
                        </section>
                    </CardContent>
                </Card>

                <div className="text-center mt-6">
                    <Link href="/register">
                        <Button>Volver al registro</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
