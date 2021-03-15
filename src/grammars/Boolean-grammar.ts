export const grammar=`<grammar root="decision">
<rule id="decision">
   <ruleref uri="#boolean"/>
   <tag>out.boolean = new Object(); out.boolean.yesno=rules.boolean.yesno;</tag>

</rule>
<rule id="TrueFalse">
   <one-of>
      <item>yes<tag>out="True";</tag></item>
      <item>of course<tag>out="True";</tag></item>
      <item>absolutely<tag>out="True";</tag></item>
      <item>no<tag>out="False";</tag></item>
      <item>nop<tag>out="False";</tag></item>
      <item>not at all<tag>out="False";</tag></item>
   </one-of>
</rule>

<!-- The properties on left hand side Rule Variable -->
<rule id="boolean">
   <ruleref uri="#TrueFalse"/>
   <tag>out.yesno=rules.TrueFalse;</tag>
</rule>

</grammar>`


