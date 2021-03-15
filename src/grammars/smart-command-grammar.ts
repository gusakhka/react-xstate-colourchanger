export const grammar=`<grammar root="utterances">
<rule id="utterances">
   <ruleref uri="#command"/>
   <tag>out.command = new Object();out.command.action=rules.command.action;
        out.command.object=rules.command.object;</tag>

</rule>

<rule id="actions1">
<one-of> 
<item> turn on <tag> out = 'on'; </tag></item>
<item> turn off <tag> out = 'off'; </tag></item>
</one-of>
</rule>

<rule id="actions11">
<one-of>
<item> open </item>
<item> close </item>
</one-of>
</rule>

<rule id="actions2">
<one-of> 
<item> on </item>>
<item> off </item> 
</one-of>
</rule>


<rule id="objects1">
<one-of> 
<item> light </item>
<item> lights </item>  
<item> heat </item> 
<item> A C <tag> out = 'air conditioning'; </tag></item>
<item> air conditioning </item>
</one-of>
</rule>

<rule id="objects2">
<one-of> 
<item> window </item>
<item> door </item> 
</one-of>
</rule>



<!-- Two properties (action1, object1) on left hand side Rule Variable -->
<rule id="command">
   <item repeat="0-1">
   <ruleref uri="#actions1"/>
   <tag>out.action=rules.actions1;</tag> 
   the
   <ruleref uri="#objects1"/>
   <tag>out.object=rules.objects1;</tag>
   </item>
 
   <item repeat="0-1">
   <ruleref uri="#actions11"/>
   <tag>out.action=rules.actions11;</tag> 
   the
   <ruleref uri="#objects2"/>
   <tag>out.object=rules.objects2;</tag>
   </item>

   <item repeat="0-1">
   please
   <ruleref uri="#actions1"/>
   <tag>out.action=rules.actions1;</tag> 
   the
   <ruleref uri="#objects1"/>
   <tag>out.object=rules.objects1;</tag>
   </item>

   <item repeat="0-1">
   please
   <ruleref uri="#actions11"/>
   <tag>out.action=rules.actions11;</tag> 
   the
   <ruleref uri="#objects2"/>
   <tag>out.object=rules.objects2;</tag>
   </item>

   <item repeat="0-1">
   turn the
   <ruleref uri="#objects1"/>
   <tag>out.object=rules.objects1;</tag>
   <ruleref uri="#actions2"/>
   <tag>out.action=rules.actions2;</tag> 
   </item>

   <item repeat="0-1">
   please turn the
   <ruleref uri="#objects1"/>
   <tag>out.object=rules.objects1;</tag>
   <ruleref uri="#actions2"/>
   <tag>out.action=rules.actions2;</tag> 
   </item>
</rule>


</grammar>

`
